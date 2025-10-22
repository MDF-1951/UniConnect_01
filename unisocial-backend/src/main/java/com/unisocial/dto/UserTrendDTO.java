package com.unisocial.dto;

import java.time.LocalDate;

public class UserTrendDTO {
    private LocalDate date;
    private Long count;

    public UserTrendDTO() {}

    public UserTrendDTO(LocalDate date, Long count) {
        this.date = date;
        this.count = count;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

    @Override
    public String toString() {
        return "UserTrendDTO{" +
                "date=" + date +
                ", count=" + count +
                '}';
    }
}



