package duan.sportify.DTO;

import java.util.Date;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class FieldOwnerRegistrationResponse {
    Long ownerId;
    String businessName;
    String businessEmail;
    String phone;
    String address;
    String idNumber;
    String idFrontUrl;
    String idBackUrl;
    String businessLicenseUrl;
    String status;
    String rejectReason;
    Date createdAt;
    Date updatedAt;
    String username;
}