// 상품 재고
package org.example.coffee.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "product_variant",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_product_variant",
            columnNames = {"product_id", "option_id"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variant_id")
    private Long variantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private ProductOption option;

    @Column(name = "stock", nullable = false)
    private int stock;
}
