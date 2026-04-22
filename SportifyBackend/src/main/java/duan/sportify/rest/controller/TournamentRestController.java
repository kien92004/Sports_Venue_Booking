package duan.sportify.rest.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import duan.sportify.entities.Tournament;
import duan.sportify.service.TournamentService;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/tournaments")
public class TournamentRestController {

    @Autowired
    private TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<List<Tournament>> getAll() {
        return ResponseEntity.ok(tournamentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tournament> getOne(@PathVariable("id") Integer id) {
        Tournament tournament = tournamentService.findById(id);
        if (tournament == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tournament);
    }

    @PostMapping
    public ResponseEntity<Tournament> create(@RequestBody Tournament tournament) {
        System.out.println("Tạo giải đấu: " + tournament);
        return ResponseEntity.ok(tournamentService.create(tournament));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tournament> update(@PathVariable("id") Integer id, @RequestBody Tournament tournament) {
        System.out.println("Cập nhật giải đấu: " + tournament);
        return ResponseEntity.ok(tournamentService.update(tournament));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        tournamentService.delete(id);
        return ResponseEntity.ok().build();
    }
}
