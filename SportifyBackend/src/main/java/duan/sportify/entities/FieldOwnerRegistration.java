package duan.sportify.entities;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "infor_owner", catalog = "sportify")
public class FieldOwnerRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "business_name", nullable = false, length = 150)
    private String businessName;

    @Column(name = "business_email", nullable = false, length = 150)
    private String businessEmail;

    @Column(name = "owner_password", nullable = true, length = 150)
    private String ownerPassword;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "id_number", length = 50)
    private String idNumber;

    @Column(name = "id_front_url", columnDefinition = "LONGTEXT")
    private String idFrontUrl;

    @Column(name = "id_back_url", columnDefinition = "LONGTEXT")
    private String idBackUrl;

    @Column(name = "business_license_url", columnDefinition = "LONGTEXT")
    private String businessLicenseUrl;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @Column(name = "username", length = 16)
    private String username;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at", nullable = false)
    private Date updatedAt;
}
