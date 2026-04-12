package duan.sportify.service.impl;

import java.time.LocalDate;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import duan.sportify.dao.AuthorizedDAO;
import duan.sportify.dao.TeamDetailDAO;
import duan.sportify.entities.Authorized;
import duan.sportify.entities.Teamdetails;
import duan.sportify.service.AuthorizedService;
import duan.sportify.service.TeamDetailService;

@SuppressWarnings("unused")
@Service
@Transactional
public class TeamDetailServiceImpl implements TeamDetailService{
	@Autowired
	TeamDetailDAO teamDetailDAO;

	public boolean confirmMember(Integer teamId, String username) {
        Teamdetails user = teamDetailDAO.findOneUserCheckByIdTeam0(teamId, username);
        if (user == null) return false;

        user.setStatus(true);
        user.setJoindate(LocalDate.now());
		user.setInfouser(username + " đã là thành viên của đội");
        teamDetailDAO.save(user);
        return true;
    }
	@Override
	public List<Teamdetails> findAll() {
		// TODO Auto-generated method stub
		return teamDetailDAO.findAll();
	}

	@Override
	public Teamdetails create(Teamdetails teamdetails) {
		// TODO Auto-generated method stub
		return teamDetailDAO.save(teamdetails);
	}

	@Override
	public Teamdetails update(Teamdetails teamdetails) {
		// TODO Auto-generated method stub
		return teamDetailDAO.save(teamdetails);
	}

	@Override
	public void delete(Integer id) {
		// TODO Auto-generated method stub
		teamDetailDAO.deleteById(id);
	}

	@Override
	public Teamdetails findById(Integer id) {
		// TODO Auto-generated method stub
		return teamDetailDAO.findById(id).get();
	}
	
}
