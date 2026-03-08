package com.invoice.portal.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class InvoiceExtractorServiceTest {

    @Mock
    private ApplicationContext applicationContext;

    @InjectMocks
    private InvoiceExtractorService invoiceExtractorService;

    @Test
    public void testExtractData_FallbackMockData() throws Exception {
        // Arrange
        // Simulate missing Gemini bean
        when(applicationContext.getBean(any(Class.class))).thenThrow(new RuntimeException("Bean not found"));

        Path tempFile = Files.createTempFile("test-invoice", ".pdf");
        Files.write(tempFile, "dummy content".getBytes());
        File file = tempFile.toFile();

        // Act
        InvoiceExtractorService.ExtractedData data = invoiceExtractorService.extractData(file);

        // Assert
        assertNotNull(data);
        assertEquals("Mock Vendor Corp", data.vendorName);
        assertNotNull(data.invoiceNumber);

        // Cleanup
        file.delete();
    }
}
