package duan.sportify.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import duan.sportify.entities.Tournament;

public interface TournamentDAO extends JpaRepository<Tournament, Integer> {
}
