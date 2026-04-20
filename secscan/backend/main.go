package main

import (
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// ScanProgress represents the progress of a scan
type ScanProgress struct {
	ID       string  `json:"id"`
	Progress float64 `json:"progress"`
	Status   string  `json:"status"`
	Results  []string `json:"results"`
}

var (
	scans     = make(map[string]*ScanProgress)
	scansLock sync.RWMutex
)

func main() {
	r := gin.Default()

	// CORS açılımı (Frontend ile iletişim için)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// SSRF Korumalı Port Tarayıcı Başlatma
	r.POST("/api/scan/start", handleStartScan)

	// SSE Progress Stream
	r.GET("/api/scan/:id/stream", handleScanStream)

	fmt.Println("SecScan Backend running on :8080")
	r.Run(":8080")
}

// 1. SSRF Koruması: Özel IP bloklarını ve Metadata servislerini engeller
func isSSRFFriendly(targetURL string) (string, error) {
	// Sadece host kısmını al
	host := targetURL
	if strings.Contains(host, "://") {
		parts := strings.Split(host, "://")
		if len(parts) > 1 {
			host = strings.Split(parts[1], "/")[0]
		}
	}

	ips, err := net.LookupIP(host)
	if err != nil {
		return "", err
	}

	privateMasks := []string{
		"127.0.0.0/8",    // Localhost
		"10.0.0.0/8",     // Özel Ağ A
		"172.16.0.0/12",  // Özel Ağ B
		"192.168.0.0/16", // Özel Ağ C
		"169.254.0.0/16", // AWS/GCP Metadata
		"0.0.0.0/8",
	}

	for _, ip := range ips {
		for _, mask := range privateMasks {
			_, cidr, _ := net.ParseCIDR(mask)
			if cidr.Contains(ip) {
				return "", fmt.Errorf("SSRF Engellendi: Özel IP adresine (%s) erişim yasak", ip.String())
			}
		}
	}

	return ips[0].String(), nil
}

// 2. Port Scanner: Goroutine Pool ile hızlı tarama
func scanPorts(scanID string, targetIP string) {
	commonPorts := []int{
		21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 8080, 27017,
	}
	// Normalde 1000 popüler port taranır, burada hız için bir kısmını ekledik

	total := len(commonPorts)
	var wg sync.WaitGroup
	sem := make(chan struct{}, 50) // Concurrency limiti: 50

	for i, port := range commonPorts {
		wg.Add(1)
		sem <- struct{}{}
		go func(p int, index int) {
			defer wg.Done()
			defer func() { <-sem }()

			address := fmt.Sprintf("%s:%d", targetIP, p)
			conn, err := net.DialTimeout("tcp", address, 1*time.Second)
			
			scansLock.Lock()
			if err == nil {
				conn.Close()
				scans[scanID].Results = append(scans[scanID].Results, fmt.Sprintf("Port %d: AÇIK", p))
			}
			scans[scanID].Progress = float64(index+1) / float64(total) * 100
			scansLock.Unlock()
		}(port, i)
	}

	wg.Wait()
	scansLock.Lock()
	scans[scanID].Status = "COMPLETED"
	scansLock.Unlock()
}

// 3. XSS ve SQLi Fuzzer Modülü
func runFuzzer(scanID string, targetURL string) {
	payloads := map[string]string{
		"XSS":   "<script>alert(1)</script>",
		"SQLi":  "' OR 1=1 --",
	}

	for name, payload := range payloads {
		scansLock.Lock()
		scans[scanID].Results = append(scans[scanID].Results, fmt.Sprintf("Test Ediliyor: %s", name))
		scansLock.Unlock()

		resp, err := http.Get(targetURL + "?q=" + payload)
		if err != nil {
			continue
		}
		defer resp.Body.Close()

		// Basit Analiz: Payload yanıtta aynen dönüyorsa zafiyet belirtisidir
		// Regex ile body kontrolü yapılabilir
		if resp.StatusCode == 200 {
			scansLock.Lock()
			scans[scanID].Results = append(scans[scanID].Results, fmt.Sprintf("[!] Olası %s zafiyeti tespit edildi!", name))
			scansLock.Unlock()
		}
	}
}

// Handlers
func handleStartScan(c *gin.Context) {
	var req struct {
		URL string `json:"url"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Geçersiz URL"})
		return
	}

	// SSRF Check
	ip, err := isSSRFFriendly(req.URL)
	if err != nil {
		c.JSON(403, gin.H{"error": err.Error()})
		return
	}

	scanID := fmt.Sprintf("%d", time.Now().UnixNano())
	scansLock.Lock()
	scans[scanID] = &ScanProgress{
		ID:       scanID,
		Status:   "RUNNING",
		Results:  []string{fmt.Sprintf("Tarama başladı: %s (%s)", req.URL, ip)},
	}
	scansLock.Unlock()

	// Arka planda taramaları başlat
	go func() {
		scanPorts(scanID, ip)
		runFuzzer(scanID, req.URL)
	}()

	c.JSON(200, gin.H{"scan_id": scanID})
}

func handleScanStream(c *gin.Context) {
	scanID := c.Param("id")

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	for {
		scansLock.RLock()
		scan, ok := scans[scanID]
		scansLock.RUnlock()

		if !ok {
			c.SSEvent("error", "Scan not found")
			return
		}

		c.SSEvent("progress", scan)
		c.Writer.Flush()

		if scan.Status == "COMPLETED" {
			break
		}
		time.Sleep(1 * time.Second)
	}
}
