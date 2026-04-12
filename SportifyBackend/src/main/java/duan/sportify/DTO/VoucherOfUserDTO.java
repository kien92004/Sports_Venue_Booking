package duan.sportify.DTO;

import lombok.Data;

@Data
public class VoucherOfUserDTO {
    private String username;
    private String voucherid;
    private Integer quantity;
    private String startDate;
    private String endDate;
}
