package duan.sportify.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import duan.sportify.entities.Field;

public interface FieldRepository extends JpaRepository<Field, Integer>, JpaSpecificationExecutor<Field> {
}
