package com.leadora.backend.controller;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.leadora.backend.dto.ApiResponse;
import com.leadora.backend.service.ReportService;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/{reportType}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReport(@PathVariable String reportType) {
        Map<String, Object> data = reportService.getReportData(reportType);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/{reportType}/csv")
    public ResponseEntity<byte[]> exportCsv(@PathVariable String reportType) {
        String csv = reportService.generateCsv(reportType);
        byte[] bytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"leadora_" + reportType + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
