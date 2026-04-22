package duan.sportify.service;

import java.util.List;
import duan.sportify.entities.Tournament;

public interface TournamentService {
    List<Tournament> findAll();
    Tournament findById(Integer id);
    Tournament create(Tournament tournament);
    Tournament update(Tournament tournament);
    void delete(Integer id);
}
