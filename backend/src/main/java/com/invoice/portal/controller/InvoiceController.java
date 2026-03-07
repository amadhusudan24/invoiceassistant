package com.invoice.portal.controller;

import com.invoice.portal.entity.Invoice;
import com.invoice.portal.repository.InvoiceRepository;
import com.invoice.portal.service.InvoiceExtractorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceExtractorService extractorService;

    @Value("${upload.dir}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceRepository.findAll());
    }

    @PostMapping("/upload")
    public ResponseEntity<Invoice> uploadInvoice(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // Save file
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            Path filePath = uploadPath.resolve(originalFilename != null ? originalFilename : "unknown.pdf");
            file.transferTo(filePath.toFile());

            // Create initial processing record
            Invoice invoice = new Invoice();
            invoice.setOriginalFileName(originalFilename);
            invoice.setStatus(Invoice.InvoiceStatus.PROCESSING);
            invoice = invoiceRepository.save(invoice);

            try {
                // Extract Data
                InvoiceExtractorService.ExtractedData data = extractorService.extractData(filePath.toFile());

                // Update invoice
                invoice.setVendorName(data.vendorName);
                invoice.setInvoiceNumber(data.invoiceNumber);
                invoice.setInvoiceDate(data.invoiceDate);
                invoice.setTotalAmount(data.totalAmount);
                invoice.setTaxAmount(data.taxAmount);
                invoice.setStatus(Invoice.InvoiceStatus.COMPLETED);
                invoice = invoiceRepository.save(invoice);

            } catch (Exception e) {
                invoice.setStatus(Invoice.InvoiceStatus.FAILED);
                invoice = invoiceRepository.save(invoice);
            }

            return ResponseEntity.ok(invoice);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id, @RequestBody Invoice updatedData) {
        return invoiceRepository.findById(id).map(existing -> {
            existing.setVendorName(updatedData.getVendorName());
            existing.setInvoiceNumber(updatedData.getInvoiceNumber());
            existing.setInvoiceDate(updatedData.getInvoiceDate());
            existing.setTotalAmount(updatedData.getTotalAmount());
            existing.setTaxAmount(updatedData.getTaxAmount());
            
            // If it was failed or processing, and user edits it, mark completed
            existing.setStatus(Invoice.InvoiceStatus.COMPLETED);
            
            return ResponseEntity.ok(invoiceRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }
}
