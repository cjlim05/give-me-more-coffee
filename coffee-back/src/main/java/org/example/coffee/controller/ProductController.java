package org.example.coffee.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.example.coffee.dto.ProductDetailResponse;
import org.example.coffee.entity.Product;
import org.example.coffee.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    // 최근 입고
    @GetMapping("/latest")
    public List<Product> getLatest() {
        return productService.getLatestProducts();
    }

    // 베스트 셀렉션
    @GetMapping("/best")
    public List<Product> getBest() {
        return productService.getBestProducts();
    }

    // 상품 상세 (옵션, 이미지 포함)
    @GetMapping("/{productId}")
    public ProductDetailResponse getDetail(@PathVariable Long productId) {
        return productService.getProductDetailWithOptions(productId);
    }

    // 원산지별 필터
    @GetMapping("/filter/nationality")
    public List<Product> getByNationality(@RequestParam String value) {
        return productService.getProductsByNationality(value);
    }

    // 가공방식별 필터
    @GetMapping("/filter/type")
    public List<Product> getByType(@RequestParam String value) {
        return productService.getProductsByType(value);
    }
}
