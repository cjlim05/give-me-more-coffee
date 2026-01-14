package org.example.coffee.service;

import java.util.List;

import org.springframework.stereotype.Service;

import org.example.coffee.entity.Product;
import org.example.coffee.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getLatestProducts() {
        return productRepository.findTop10ByOrderByProductIdDesc();
    }

    public List<Product> getBestProducts() {
        return productRepository.findTop10ByCategoryId(1L);
    }

    public Product getProductDetail(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));
    }
}
