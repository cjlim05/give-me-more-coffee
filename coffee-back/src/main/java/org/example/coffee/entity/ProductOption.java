// 상품 옵션
package org.example.coffee.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_option")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProductOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id")
    private Long optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "option_value", nullable = false, length = 50)
    private String optionValue;

    @Column(name = "extra_price", nullable = false)
    private int extraPrice;
}
