package org.example.coffee.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PointHistoryResponse {

    private Long historyId;
    private Integer amount;
    private String type;
    private String description;
    private Long orderId;
    private Integer balance;
    private LocalDateTime createdAt;
}
