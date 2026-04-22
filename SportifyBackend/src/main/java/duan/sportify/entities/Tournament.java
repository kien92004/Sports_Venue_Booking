package duan.sportify.entities;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tournaments")
public class Tournament implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tournamentid")
    private Integer tournamentid;

    @Column(name = "tournamentname", nullable = false, length = 100)
    private String tournamentname;

    @ManyToOne
    @JoinColumn(name = "sporttypeid")
    private Sporttype sporttype;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Temporal(TemporalType.DATE)
    @Column(name = "startdate")
    private Date startdate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Temporal(TemporalType.DATE)
    @Column(name = "enddate")
    private Date enddate;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "image", length = 255)
    private String image;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "teamcount")
    private Integer teamcount;
}
