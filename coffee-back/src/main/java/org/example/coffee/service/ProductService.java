package org.example.coffee.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import org.example.coffee.dto.ProductDetailResponse;
import org.example.coffee.entity.Product;
import org.example.coffee.entity.ProductImage;
import org.example.coffee.entity.ProductOption;
import org.example.coffee.repository.ProductRepository;
import org.example.coffee.repository.ProductOptionRepository;
import org.example.coffee.repository.ProductImageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final ProductImageRepository productImageRepository;

    public List<Product> getLatestProducts() {
        return productRepository.findTop10ByOrderByProductIdDesc();
    }

    public List<Product> getBestProducts() {
        return productRepository.findTop10ByOrderByProductIdAsc();
    }

    public Product getProductDetail(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));
    }

    public ProductDetailResponse getProductDetailWithOptions(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));

        List<ProductOption> options = productOptionRepository.findByProduct_ProductId(productId);
        List<ProductImage> images = productImageRepository.findByProduct_ProductIdOrderBySortOrderAsc(productId);

        List<ProductDetailResponse.OptionDto> optionDtos = options.stream()
                .map(opt -> ProductDetailResponse.OptionDto.builder()
                        .optionId(opt.getOptionId())
                        .optionValue(opt.getOptionValue())
                        .extraPrice(opt.getExtraPrice())
                        .build())
                .collect(Collectors.toList());

        List<ProductDetailResponse.ImageDto> imageDtos = images.stream()
                .map(img -> ProductDetailResponse.ImageDto.builder()
                        .imageId(img.getImageId())
                        .imageUrl(img.getImageUrl())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        return ProductDetailResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .basePrice(product.getBasePrice())
                .continent(product.getContinent())
                .nationality(product.getNationality())
                .type(product.getType())
                .thumbnailImg(product.getThumbnailImg())
                .detailImg(product.getDetailImg())
                .options(optionDtos)
                .images(imageDtos)
                .build();
    }

    public List<Product> getProductsByNationality(String nationality) {
        return productRepository.findByNationality(nationality);
    }

    public List<Product> getProductsByType(String type) {
        return productRepository.findByType(type);
    }

    public List<Product> getProductsByContinent(String continent) {
        return productRepository.findByContinent(continent);
    }
}
