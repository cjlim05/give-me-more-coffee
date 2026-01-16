package org.example.coffee.entity;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "product")
@Getter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")   // 🔥 이게 핵심
    private Long productId;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "base_price", nullable = false)
    private int basePrice;

    @Column(length = 50)
    private String continent;     // 대륙: 아프리카, 중남미, 아시아

    @Column(length = 100)
    private String nationality;   // 나라: 에티오피아, 케냐...

    @Column(length = 100)
    private String type;          // 가공방식: 워시드, 내추럴...

    @Column(name = "thumbnail_img", length = 250)
    private String thumbnailImg;

    @Column(name = "detail_img", length = 250)
    private String detailImg;
}
