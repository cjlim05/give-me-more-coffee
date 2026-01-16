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

    @Column(length = 100)
    private String nationality;   // DB: varchar(100)

    @Column(length = 100)
    private String type;          // DB: varchar(100)

    @Column(name = "thumbnail_img", length = 250)
    private String thumbnailImg;

    @Column(name = "detail_img", length = 250)
    private String detailImg;
}
