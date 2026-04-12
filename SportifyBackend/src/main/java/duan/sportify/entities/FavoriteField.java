package duan.sportify.entities;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.*;

@Entity
@Table(name = "favorite")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FavoriteField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

     @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "username", referencedColumnName = "username", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users username;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fieldid", referencedColumnName = "fieldid", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Field field;
    
    public String getUsername() {
        return username != null ? username.getUsername() : null;
    }
}
