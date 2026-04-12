package duan.sportify.entities;

import javax.persistence.*;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.*;

import java.time.LocalDate;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "permanent_booking")
public class PermanentBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permanent_id")
    private Integer permanentId;


    @Column(name = "start_date", nullable = false)
        @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @Column(name = "end_date")
        @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @Column(name = "active", nullable = false)
    private Integer active = 1;

      @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 1 = Monday ... 7 = Sunday

    @Column(name = "field_id", nullable = false)
    private Integer fieldId;

    @Column(name = "shift_id", nullable = false)
    private Integer shiftId;

    @Column(name = "booking_id", nullable = false, length = 16)
    private Integer bookingId;
   

    // Quan hệ với Field
     @JsonIgnore
     @ManyToOne

    @JoinColumn(name="booking_id", referencedColumnName="bookingid", insertable=false, updatable=false)
    private Bookings   booking ; 

     @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "field_id", insertable = false, updatable = false)
    private Field field;
    // Quan hệ với Shift
     @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "shift_id", insertable = false, updatable = false)
    private Shifts shift;

}
