package duan.sportify.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class FootballDataService {

    @Value("${sports.api.football-data.key}")
    private String apiKey;

    @Value("${sports.api.football-data.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public FootballDataService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Lấy danh sách trận đấu sắp tới từ Premier League
     */
    public List<Map<String, Object>> getUpcomingMatches() {
        List<Map<String, Object>> matches = new ArrayList<>();

        try {
            System.out.println("🔄 Fetching matches from Football-Data.org API...");

            // Premier League ID trong Football-Data.org là 2021
            String url = baseUrl + "/competitions/2021/matches?status=SCHEDULED";

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Auth-Token", apiKey);
            headers.set("Content-Type", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode matchesNode = root.get("matches");

                System.out.println("✅ API Response received. Processing matches...");

                int processedCount = 0;
                for (JsonNode matchNode : matchesNode) {
                    if (processedCount >= 20)
                        break; // Limit to 20 matches

                    Map<String, Object> match = new HashMap<>();
                    // Basic match info
                    match.put("id", matchNode.get("id").asLong());
                    match.put("homeTeam", matchNode.get("homeTeam").get("name").asText());
                    match.put("awayTeam", matchNode.get("awayTeam").get("name").asText());
                    match.put("competition", "Premier League");

                    // Date and time
                    String utcDate = matchNode.get("utcDate").asText();
                    String[] dateTime = formatDateTime(utcDate);
                    match.put("date", dateTime[0]);
                    match.put("time", dateTime[1]);

                    // Team logos (default paths)
                    String homeTeamName = matchNode.get("homeTeam").get("name").asText();
                    String awayTeamName = matchNode.get("awayTeam").get("name").asText();

                    String homeTeam = matchNode.get("homeTeam").has("crest")
                            ? matchNode.get("homeTeam").get("crest").asText()
                            : null;

                    String awayTeam = matchNode.get("awayTeam").has("crest")
                            ? matchNode.get("awayTeam").get("crest").asText()
                            : null;

                    // Nếu API có crest thì dùng, nếu không thì fallback sang local map
                    match.put("homeTeamLogo", (homeTeam != null && !homeTeam.isEmpty())
                            ? homeTeam
                            : getTeamLogo(homeTeamName));

                    match.put("awayTeamLogo", (awayTeam != null && !awayTeam.isEmpty())
                            ? awayTeam
                            : getTeamLogo(awayTeamName));

                    // Add basic prediction probabilities
                    Map<String, Integer> probabilities = calculateBasicPrediction(homeTeam, awayTeam);
                    match.put("homeWinProbability", probabilities.get("home"));
                    match.put("drawProbability", probabilities.get("draw"));
                    match.put("awayWinProbability", probabilities.get("away"));

                    // Additional info
                    match.put("venue", matchNode.has("venue") ? matchNode.get("venue").get("name").asText() : "TBA");
                    match.put("status", matchNode.get("status").asText());

                    matches.add(match);
                    processedCount++;
                }

                System.out.println("✅ Successfully processed " + processedCount + " matches from Football-Data.org");

            } else {
                System.err.println("❌ API request failed with status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            System.err.println("❌ Error fetching data from Football-Data.org: " + e.getMessage());
            e.printStackTrace();

            // Return fallback data if API fails
            return getFallbackMatches();
        }

        return matches.isEmpty() ? getFallbackMatches() : matches;
    }

    /**
     * Lấy bảng xếp hạng Premier League
     */
    public List<Map<String, Object>> getLeagueTable() {
        List<Map<String, Object>> table = new ArrayList<>();

        try {
            String url = baseUrl + "/competitions/2021/standings";

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Auth-Token", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode standingsNode = root.get("standings").get(0).get("table");

                for (JsonNode teamNode : standingsNode) {
                    Map<String, Object> teamStats = new HashMap<>();
                    teamStats.put("position", teamNode.get("position").asInt());
                    teamStats.put("team", teamNode.get("team").get("name").asText());
                    teamStats.put("points", teamNode.get("points").asInt());
                    teamStats.put("playedGames", teamNode.get("playedGames").asInt());
                    teamStats.put("won", teamNode.get("won").asInt());
                    teamStats.put("draw", teamNode.get("draw").asInt());
                    teamStats.put("lost", teamNode.get("lost").asInt());
                    teamStats.put("goalsFor", teamNode.get("goalsFor").asInt());
                    teamStats.put("goalsAgainst", teamNode.get("goalsAgainst").asInt());

                    table.add(teamStats);
                }
            }

        } catch (Exception e) {
            System.err.println("Error fetching league table: " + e.getMessage());
        }

        return table;
    }

    /**
     * Test API connection
     */
    public Map<String, String> testApiConnection() {
        Map<String, String> result = new HashMap<>();

        try {
            String url = baseUrl + "/competitions/2021";

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Auth-Token", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                result.put("status", "SUCCESS");
                result.put("message", "✅ Football-Data.org API connection successful!");

                JsonNode root = objectMapper.readTree(response.getBody());
                result.put("competition", root.get("name").asText());
                result.put("season", root.get("currentSeason").get("startDate").asText());

            } else {
                result.put("status", "ERROR");
                result.put("message", "❌ API returned status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("message", "❌ Connection failed: " + e.getMessage());
        }

        return result;
    }

    // Helper methods
    private String[] formatDateTime(String utcDate) {
        try {
            // Parse: 2024-09-15T14:00:00Z
            String[] parts = utcDate.split("T");
            String date = parts[0];
            String time = parts[1].substring(0, 5); // Remove seconds and Z

            // Convert to Vietnam time (+7 hours)
            int hour = Integer.parseInt(time.split(":")[0]);
            hour = (hour + 7) % 24;
            String vietnamTime = String.format("%02d:%s", hour, time.substring(3));

            return new String[] { date, vietnamTime };
        } catch (Exception e) {
            return new String[] { "2024-09-15", "20:00" };
        }
    }

    private String getTeamLogo(String teamName) {
        // Map team names to logo files
        Map<String, String> teamLogos = new HashMap<>();
        teamLogos.put("Manchester United", "/user/images/team1.png");
        teamLogos.put("Liverpool", "/user/images/team2.png");
        teamLogos.put("Chelsea", "/user/images/team3.png");
        teamLogos.put("Arsenal", "/user/images/team4.png");
        teamLogos.put("Manchester City", "/user/images/team5.png");
        teamLogos.put("Tottenham Hotspur", "/user/images/team6.png");
        teamLogos.put("Arsenal FC", "/user/images/team4.png");
        teamLogos.put("Nottingham Forest FC", "/user/images/team7.png");
        teamLogos.put("AFC Bournemouth", "/user/images/team8.png");
        teamLogos.put("Brighton & Hove Albion FC", "/user/images/team9.png");
        teamLogos.put("Crystal Palace FC", "/user/images/team1.png");
        teamLogos.put("Sunderland AFC", "/user/images/team2.png");
        teamLogos.put("Everton FC", "/user/images/team3.png");
        teamLogos.put("Aston Villa FC", "/user/images/team4.png");

        return teamLogos.getOrDefault(teamName, "/user/images/team-default.png");
    }

    private Map<String, Integer> calculateBasicPrediction(String homeTeam, String awayTeam) {
        Map<String, Integer> probabilities = new HashMap<>();

        // Simple prediction logic based on team names (can be enhanced with real
        // statistics)
        List<String> strongTeams = Arrays.asList("Manchester City", "Arsenal", "Liverpool", "Manchester United");

        boolean homeStrong = strongTeams.contains(homeTeam);
        boolean awayStrong = strongTeams.contains(awayTeam);

        if (homeStrong && !awayStrong) {
            probabilities.put("home", 55);
            probabilities.put("draw", 25);
            probabilities.put("away", 20);
        } else if (!homeStrong && awayStrong) {
            probabilities.put("home", 20);
            probabilities.put("draw", 25);
            probabilities.put("away", 55);
        } else {
            // Balanced match
            probabilities.put("home", 40);
            probabilities.put("draw", 30);
            probabilities.put("away", 30);
        }

        return probabilities;
    }

    private List<Map<String, Object>> getFallbackMatches() {
        System.out.println("🔄 Using fallback data...");

        List<Map<String, Object>> matches = new ArrayList<>();

        String[][] fallbackData = {
                { "Manchester United", "Liverpool" },
                { "Chelsea", "Arsenal" },
                { "Manchester City", "Tottenham Hotspur" },
                { "Newcastle United", "Brighton & Hove Albion" }
        };

        for (int i = 0; i < fallbackData.length; i++) {
            Map<String, Object> match = new HashMap<>();
            match.put("id", (long) (i + 1));
            match.put("homeTeam", fallbackData[i][0]);
            match.put("awayTeam", fallbackData[i][1]);
            match.put("date", LocalDate.now().plusDays(i + 1).format(DateTimeFormatter.ISO_LOCAL_DATE));
            match.put("time", String.format("%02d:30", 15 + i));
            match.put("competition", "Premier League");
            match.put("homeTeamLogo", getTeamLogo(fallbackData[i][0]));
            match.put("awayTeamLogo", getTeamLogo(fallbackData[i][1]));

            Map<String, Integer> probabilities = calculateBasicPrediction(fallbackData[i][0], fallbackData[i][1]);
            match.put("homeWinProbability", probabilities.get("home"));
            match.put("drawProbability", probabilities.get("draw"));
            match.put("awayWinProbability", probabilities.get("away"));

            matches.add(match);
        }

        return matches;
    }
}
