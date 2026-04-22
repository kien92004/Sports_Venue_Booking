package duan.sportify.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import duan.sportify.dao.TournamentDAO;
import duan.sportify.entities.Tournament;
import duan.sportify.service.TournamentService;

@Service
public class TournamentServiceImpl implements TournamentService {

    @Autowired
    private TournamentDAO tournamentDAO;

    @Override
    public List<Tournament> findAll() {
        return tournamentDAO.findAll();
    }

    @Override
    public Tournament findById(Integer id) {
        return tournamentDAO.findById(id).orElse(null);
    }

    @Override
    public Tournament create(Tournament tournament) {
        return tournamentDAO.save(tournament);
    }

    @Override
    public Tournament update(Tournament tournament) {
        return tournamentDAO.save(tournament);
    }

    @Override
    public void delete(Integer id) {
        tournamentDAO.deleteById(id);
    }
}
