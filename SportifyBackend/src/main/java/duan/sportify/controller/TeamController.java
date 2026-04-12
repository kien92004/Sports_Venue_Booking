package duan.sportify.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import duan.sportify.dao.TeamDAO;
import duan.sportify.dao.TeamDetailDAO;
import duan.sportify.entities.Sporttype;
import duan.sportify.entities.Teamdetails;
import duan.sportify.entities.Teams;
import duan.sportify.service.SportTypeService;
import duan.sportify.service.TeamDetailService;
import duan.sportify.service.TeamService;
import duan.sportify.service.UploadService;
import duan.sportify.service.UserService;

@SuppressWarnings("unused")
@RequestMapping("/api")
@RestController
public class TeamController {

    @Autowired
    private TeamDAO teamdao;

    @Autowired
    UserService userService;

    @Autowired
    TeamDetailDAO detailDAO;

    @Autowired
    TeamDetailService teamDetailService;

    @Autowired
    TeamService teamService;

    @Autowired
    SportTypeService sportTypeService;

    @Autowired
    UploadService uploadService;

    // Đỗ danh Sách bộ Lọc
    @ModelAttribute("sporttypeList")
    public List<Sporttype> getSporttypeList() {
        return sportTypeService.findAll();
    }

    // Đỗ toàn bộ dữ liệu liên quan đến team
    @GetMapping("/user/team")
    public ResponseEntity<?> viewTeam(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "") String searchText,
            @RequestParam(defaultValue = "") String sporttypeid,
            @RequestParam(defaultValue = "") String TeamUsername) {

        int size = 4;
        String usernameLogin = (String) request.getSession().getAttribute("username");

        List<Object[]> teamPage;

        if (!searchText.isEmpty() && sporttypeid.isEmpty() && TeamUsername.isEmpty()) {
            teamPage = teamdao.SearchTeam(searchText);
        } else if (searchText.isEmpty() && !sporttypeid.isEmpty() && TeamUsername.isEmpty()) {
            teamPage = teamdao.FilterTeam(sporttypeid);
        } else if (searchText.isEmpty() && sporttypeid.isEmpty() && !TeamUsername.isEmpty()) {
            if (usernameLogin != null) {
                teamPage = teamdao.findTeamUsername(usernameLogin);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "Bạn cần đăng nhập để xem đội của mình"));
            }
        } else {
            teamPage = teamdao.findAllTeam();
        }

        // Nếu có đăng nhập thì trả thêm team của user
        List<Object[]> teamUser = null;
        if (usernameLogin != null) {
            teamUser = teamdao.findTeamUsername(usernameLogin);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("teams", teamPage);
        response.put("searchText", searchText);
        response.put("TeamUsername", TeamUsername);
        response.put("sporttypeid", sporttypeid);

        if (teamUser != null) {
            response.put("teamUser", teamUser);
        }

        if (!searchText.isEmpty() && !teamPage.isEmpty()) {
            response.put("FoundMessage", "Tìm thấy " + teamPage.size() + " kết quả tìm kiếm của '" + searchText + "'.");
        }
        if (teamPage.isEmpty()) {
            response.put("notFoundMessage", "Tìm thấy 0 kết quả tìm kiếm của '" + searchText + "'.");
        }

        return ResponseEntity.ok(response);
    }

    // Tìm kiếm đội theo tên đội
    @PostMapping("user/team/search")
    public ResponseEntity<?> search(@RequestBody Map<String, String> body) {
        String searchText = body.get("searchText");

        if (searchText == null || searchText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Từ khóa tìm kiếm không được để trống"));
        }

        // Tìm team theo searchText
        List<Object[]> teams = teamdao.SearchTeam(searchText);

        if (teams.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Không tìm thấy kết quả nào cho '" + searchText + "'",
                    "teams", List.of()));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tìm thấy " + teams.size() + " kết quả cho '" + searchText + "'",
                "teams", teams));
    }

    // Tìm loại thể thao
    @GetMapping("/user/team/{sporttypeid}")
    public ResponseEntity<?> handleSportifyTeam(@PathVariable("sporttypeid") String sporttypeid) {
        if (sporttypeid == null || sporttypeid.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "sporttypeid không được để trống"));
        }

        // Lấy danh sách team theo sporttypeid
        List<Object[]> teams = teamdao.FilterTeam(sporttypeid);

        if (teams.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Không tìm thấy team nào cho sporttypeid = " + sporttypeid,
                    "teams", List.of()));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tìm thấy " + teams.size() + " team cho sporttypeid = " + sporttypeid,
                "teams", teams));
    }

    // Rời nhóm
    @GetMapping("/user/team/teamdetail/{teamId}/exit")
    public ResponseEntity<?> exitTeam(HttpServletRequest request,
            @PathVariable("teamId") Integer teamId,
            HttpSession session) {
        String username = (String) request.getSession().getAttribute("username");

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Bạn cần đăng nhập để rời team"));
        }

        Teams findTeamout = teamdao.findOneTeamUser(teamId, username);
        int count = detailDAO.countUser(teamId);

        if (findTeamout != null) {
            if (count <= 1) {
                detailDAO.deleteByUsernameAndTeamId(username, teamId);
                detailDAO.deleteAllByTeamId(teamId);
                detailDAO.deleteTeamId(username, teamId);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Bạn xóa nhóm thành công !"));
            } else {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Bạn phải nhường đội trưởng mới được rời team !"));
            }
        } else {
            detailDAO.deleteByUsernameAndTeamId(username, teamId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Bạn đã rời thành công !"));
        }
    }

    @GetMapping("/user/team/teamdetail/{teamId}")
    public ResponseEntity<?> teamdetail(HttpServletRequest request,
            @PathVariable("teamId") Integer teamId) {
        String username = (String) request.getSession().getAttribute("username");

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Bạn cần đăng nhập để xem chi tiết team"));
        }

        Teams team = teamService.findById(teamId);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy team"));
        }

        int quantity = team.getQuantity();
        Integer countMembers = detailDAO.countUser(teamId);

        // ✅ Nếu user là chủ team
        if (username.equals(team.getUsername())) {
            // lấy danh sách thành viên
            List<Object[]> userTeam = detailDAO.findUserByIdTeam(teamId);

            // lấy danh sách user chờ duyệt (status = false)
            List<Teamdetails> waitingList = detailDAO.findByTeamIdAndStatus(teamId, false);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Bạn là chủ team",
                    "teamId", teamId,
                    "teamInfo", team,
                    "listMember", userTeam,
                    "waitingList", waitingList,
                    "role", "owner",
                    "permissions", List.of("accept", "reject", "kick", "setCaptain")));
        }

        // ✅ Nếu user đã trong team
        Teamdetails checkTeamUser = detailDAO.checkTeamUser(teamId, username);
        System.out.println(
                "Kiểm tra đã là thành viên chưa: " + (checkTeamUser == null ? "yes  thành viên" : "no thành viên"));
        if (checkTeamUser != null) {
            System.out.println("Đã là thành viên");
            List<Object[]> userTeam = detailDAO.findUserByIdTeam(teamId);
            List<Object[]> userCheckTeam = detailDAO.findUserCheckByIdTeam(teamId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bạn đang trong team");
            response.put("teamId", teamId);
            response.put("teamInfo", team);
            response.put("totalMember", countMembers);
            response.put("listMember", userTeam);
            response.put("listMemberCheck", userCheckTeam);
            response.put("ownerInfo", team.getUsers());
            response.put("infouser", checkTeamUser.getInfouser());
            response.put("role", "member");
            response.put("permissions", List.of());
            return ResponseEntity.ok(response);
        }

        // ✅ Nếu user chưa trong team → còn chỗ
        if (countMembers < quantity) {
            Teamdetails checkAllTeamUser = detailDAO.checkAllTeamUser(username, teamId);

            if (checkAllTeamUser != null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Đợi đội trưởng xác nhận !"));
            }

            // Gửi yêu cầu tham gia team
            Teamdetails newUser = new Teamdetails();
            newUser.setJoindate(LocalDate.now());
            newUser.setTeamid(teamId);
            newUser.setUsername(username);
            newUser.setStatus(false);
            detailDAO.save(newUser);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Bạn đã gửi yêu cầu tham gia thành công!"));
        }

        // ✅ Team đã đủ người
        return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "Team đã đủ thành viên!"));
    }

    @PostMapping("/user/team/teamdetail/updateinfoUser")
    public ResponseEntity<?> updateUser(HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String username = (String) request.getSession().getAttribute("username");

        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Bạn cần đăng nhập để cập nhật giới thiệu"));
        }

        String description = (String) body.get("description");
        Integer teamId = (Integer) body.get("teamId");

        if (teamId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thiếu teamId"));
        }

        if (description == null || description.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thêm giới thiệu thất bại !"));
        }

        Teamdetails checkTeamUser = detailDAO.checkTeamUser(teamId, username);
        if (checkTeamUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Bạn không phải thành viên của team này"));
        }

        checkTeamUser.setInfouser(description);
        detailDAO.save(checkTeamUser);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thêm giới thiệu thành công !"));
    }

    @PostMapping("/user/team/teamdetail/xacnhan")
    public ResponseEntity<?> joinTeam(@RequestBody Map<String, Object> body) {
        Integer teamId = (Integer) body.get("teamId");
        String username = (String) body.get("username");

        if (teamId == null || username == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thiếu teamId hoặc username"));
        }

        Teams team = teamService.findById(teamId);
        int quantity = team.getQuantity();
        Integer countMembers = detailDAO.countUser(teamId);

        if (countMembers < quantity) {
            if (teamDetailService.confirmMember(teamId, username)) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Xác nhận thành viên thành công !"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy yêu cầu tham gia của user này"));
            }
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "message", "Team của bạn đã đủ thành viên !"));
        }
    }

    @PostMapping("/user/team/teamdetail/tuchoi")
    public ResponseEntity<?> tuchoi(@RequestBody Map<String, Object> body) {
        Integer teamId = (Integer) body.get("teamId");
        String username = (String) body.get("username");

        if (teamId == null || username == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thiếu teamId hoặc username"));
        }

        Teamdetails checkOneTeamUser = detailDAO.findOneUserCheckByIdTeam0(teamId, username);
        if (checkOneTeamUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy yêu cầu tham gia của user này"));
        }

        detailDAO.delete(checkOneTeamUser);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Từ chối thành viên thành công !"));
    }

    @PostMapping("/user/team/teamdetail/kick")
    public ResponseEntity<?> kickMember(@RequestBody Map<String, Object> body) {
        Integer teamId = (Integer) body.get("teamId");
        String username = (String) body.get("username");

        if (teamId == null || username == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thiếu teamId hoặc username"));
        }

        Teamdetails checkOneTeamUser = detailDAO.findOneUserCheckByIdTeam1(teamId, username);
        if (checkOneTeamUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy thành viên này trong team"));
        }

        detailDAO.delete(checkOneTeamUser);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Mời thành viên rời nhóm thành công !"));
    }

    @PostMapping("/user/team/teamdetail/phongdoitruong")
    public ResponseEntity<?> phongDoiTruong(HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        Integer teamId = (Integer) body.get("teamId");
        String username = (String) body.get("username");

        if (teamId == null || username == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thiếu teamId hoặc username"));
        }

        // Username đang login (đội trưởng hiện tại)
        String usernameLogin = (String) request.getSession().getAttribute("username");

        // Kiểm tra user này đã làm đội trưởng ở nhóm khác chưa
        Teams findTeamin = teamdao.findOneTeamUserin(username);
        if (findTeamin != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "message", "Người này đang làm đội trưởng 1 nhóm khác !"));
        }

        // Đổi đội trưởng
        Teams findTeamout = teamdao.findOneTeamUser(teamId, usernameLogin);
        if (findTeamout == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy team hoặc bạn không phải đội trưởng"));
        }

        findTeamout.setUsername(username); // Cập nhật đội trưởng
        teamdao.save(findTeamout);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Phong đội trưởng thành công !"));
    }

    // Tạo đội
    @PostMapping("/user/team/createTeam")
    public ResponseEntity<?> createTeam(
            HttpServletRequest request,
            @RequestParam("newNameteam") String newNameteam,
            @RequestParam(value = "newAvatar", required = false) MultipartFile newAvatar,
            @RequestParam("newContact") String newContact,
            @RequestParam("newQuantity") Integer newQuantity,
            @RequestParam("newSporttypeid") String newSporttypeid,
            @RequestParam("newDescriptions") String newDescriptions) {

        String usernameLogin = (String) request.getSession().getAttribute("username");
        if (usernameLogin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Bạn cần đăng nhập để tạo đội"));
        }

        List<Object[]> existingTeams = teamdao.findTeamUsername(usernameLogin);
        if (!existingTeams.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Mỗi người chỉ tạo được 1 đội"));
        }

        Teams newTeam = new Teams();
        newTeam.setNameteam(newNameteam);
        newTeam.setContact(newContact);
        newTeam.setQuantity(newQuantity);
        newTeam.setSporttypeid(newSporttypeid);
        newTeam.setDescriptions(newDescriptions);
        newTeam.setUsername(usernameLogin);
        newTeam.setCreatedate(LocalDate.now());

        // Lưu ảnh
        if (newAvatar != null && !newAvatar.isEmpty()) {
            try {
                // Upload ảnh lên Cloudinary
                String imageUrl = uploadService.uploadImage(newAvatar, "field_images");
                newTeam.setAvatar(imageUrl);
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Upload avatar thất bại: " + e.getMessage());
            }
        }
        teamdao.save(newTeam);

        // Thêm đội trưởng
        Teamdetails td = new Teamdetails();
        td.setTeamid(newTeam.getTeamid());
        td.setUsername(usernameLogin);
        td.setJoindate(LocalDate.now());
        td.setStatus(true);
        detailDAO.save(td);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tạo đội thành công",
                "teamId", newTeam.getTeamid()));
    }

    @PostMapping("/sportify/team/findTeamUsername")
    public ResponseEntity<?> findTeamByUsername(@RequestBody Map<String, String> body) {
        String teamUsername = body.get("TeamUsername");

        if (teamUsername == null || teamUsername.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thiếu TeamUsername"));
        }

        Teams team = teamdao.findTeamUser(teamUsername);
        if (team == null) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Không tìm thấy đội nào của user '" + teamUsername + "'",
                    "team", null));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tìm thấy đội của user '" + teamUsername + "'",
                "team", team));
    }

    @GetMapping("/user/team/all")
    public ResponseEntity<?> getAllTeams() {
        List<Object[]> teams = teamdao.findAllTeam();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tất cả team",
                "teams", teams));
    }

}
