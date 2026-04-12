package duan.sportify.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class FootballPredictionService {

    private final RestTemplate restTemplate;
    private final FootballDataService footballDataService;

    public FootballPredictionService(FootballDataService footballDataService) {
        this.restTemplate = new RestTemplate();
        this.footballDataService = footballDataService;
    }

    /**
     * Lấy danh sách trận đấu sắp tới từ Football-Data.org API
     * Tích hợp với AI prediction engine
     */
    public List<Map<String, Object>> getUpcomingMatches() {
        System.out.println("🚀 FootballPredictionService: Getting matches with AI predictions...");

        try {
            // Lấy dữ liệu trận đấu từ Football-Data.org
            List<Map<String, Object>> matches = footballDataService.getUpcomingMatches();

            // Enhance với AI predictions
            for (Map<String, Object> match : matches) {
                enhanceWithAIPrediction(match);
            }

            System.out.println("✅ Successfully processed " + matches.size() + " matches with AI predictions");
            return matches;

        } catch (Exception e) {
            System.err.println("❌ Error in FootballPredictionService: " + e.getMessage());
            e.printStackTrace();

            // Return fallback data with basic predictions
            return getFallbackMatchesWithPredictions();
        }
    }

    /**
     * Dự đoán kết quả trận đấu dựa trên thống kê
     * TODO: Implement AI prediction algorithm using sports API data
     */
    public Map<String, Object> predictMatch(Long matchId) {
        Map<String, Object> prediction = new HashMap<>();

        // Placeholder prediction logic
        prediction.put("matchId", matchId);
        prediction.put("confidence", 75);
        prediction.put("predictedResult", "Home Win");
        prediction.put("recommendedBet", "1X");
        prediction.put("analysis", "Đội chủ nhà có phong độ tốt hơn trong 5 trận gần đây");

        return prediction;
    }

    /**
     * Lấy thống kê đội bóng từ API
     * TODO: Integrate with SportMonks/ESPN API
     */
    public Map<String, Object> getTeamStats(String teamName) {
        Map<String, Object> stats = new HashMap<>();

        // Placeholder team statistics
        stats.put("teamName", teamName);
        stats.put("gamesPlayed", 10);
        stats.put("wins", 6);
        stats.put("draws", 2);
        stats.put("losses", 2);
        stats.put("goalsFor", 18);
        stats.put("goalsAgainst", 8);
        stats.put("form", Arrays.asList("W", "W", "D", "W", "L"));

        return stats;
    }

    /**
     * Lấy dữ liệu lịch sử đối đầu
     * TODO: Implement head-to-head data from FIFA API
     */
    public List<Map<String, Object>> getHeadToHeadData(String team1, String team2) {
        List<Map<String, Object>> h2hData = new ArrayList<>();

        // Placeholder head-to-head data
        Map<String, Object> match = new HashMap<>();
        match.put("date", "2024-03-15");
        match.put("homeTeam", team1);
        match.put("awayTeam", team2);
        match.put("homeScore", 2);
        match.put("awayScore", 1);
        match.put("result", "Home Win");
        h2hData.add(match);

        return h2hData;
    }

    /**
     * Enhance match data với AI prediction
     */
    private void enhanceWithAIPrediction(Map<String, Object> match) {
        try {
            String homeTeam = (String) match.get("homeTeam");
            String awayTeam = (String) match.get("awayTeam");

            // AI analysis based on team strength and recent form
            Map<String, Object> aiAnalysis = generateAIAnalysis(homeTeam, awayTeam);

            // Add AI predictions to match
            match.put("aiConfidence", aiAnalysis.get("confidence"));
            match.put("predictedScore", aiAnalysis.get("predictedScore"));
            match.put("aiAnalysis", aiAnalysis.get("analysis"));
            match.put("recommendation", aiAnalysis.get("recommendation"));
            match.put("homeWinProbability", aiAnalysis.get("homeWinProbability"));
            match.put("drawProbability", aiAnalysis.get("drawProbability"));
            match.put("awayWinProbability", aiAnalysis.get("awayWinProbability"));
            match.put("keyFactors", aiAnalysis.get("keyFactors"));
            match.put("riskLevel", aiAnalysis.get("riskLevel"));
            match.put("alternativeRecommendation", aiAnalysis.get("alternativeRecommendation"));

        } catch (Exception e) {
            System.err.println("Error enhancing match with AI: " + e.getMessage());
        }
    }

    /**
     * Generate AI analysis for a match with detailed factors
     */
    private Map<String, Object> generateAIAnalysis(String homeTeam, String awayTeam) {
        Map<String, Object> analysis = new HashMap<>();

        // Enhanced team strength mapping with more teams
        Map<String, Integer> teamStrengths = new HashMap<>();
        teamStrengths.put("Manchester City", 95);
        teamStrengths.put("Arsenal", 90);
        teamStrengths.put("Liverpool", 88);
        teamStrengths.put("Manchester United", 82);
        teamStrengths.put("Chelsea", 80);
        teamStrengths.put("Tottenham Hotspur", 78);
        teamStrengths.put("Newcastle United", 75);
        teamStrengths.put("Brighton & Hove Albion", 70);
        teamStrengths.put("Aston Villa", 72);
        teamStrengths.put("West Ham United", 68);
        teamStrengths.put("Crystal Palace", 65);
        teamStrengths.put("Fulham", 63);
        teamStrengths.put("Wolverhampton", 61);
        teamStrengths.put("Everton", 58);
        teamStrengths.put("Brentford", 60);
        teamStrengths.put("Nottingham Forest", 55);
        teamStrengths.put("Luton Town", 45);
        teamStrengths.put("Sheffield United", 42);
        teamStrengths.put("Burnley", 40);

        // Get base team strengths
        int homeStrength = teamStrengths.getOrDefault(homeTeam, 65);
        int awayStrength = teamStrengths.getOrDefault(awayTeam, 65);

        // Calculate detailed factors
        Map<String, Object> factors = calculateDetailedFactors(homeTeam, awayTeam, homeStrength, awayStrength);

        // Apply factors to strength
        homeStrength = (int) (homeStrength * (Double) factors.get("homeFormFactor"));
        awayStrength = (int) (awayStrength * (Double) factors.get("awayFormFactor"));

        // Home advantage (3-8% depending on team)
        int homeAdvantage = calculateHomeAdvantage(homeTeam, awayTeam);
        homeStrength += homeAdvantage;

        // Head-to-head factor
        int h2hFactor = calculateHeadToHeadFactor(homeTeam, awayTeam);
        homeStrength += h2hFactor;

        // Calculate probabilities with more sophisticated algorithm
        Map<String, Integer> probabilities = calculateProbabilities(homeStrength, awayStrength, factors);

        // Predict score with more realistic algorithm
        String predictedScore = generateRealisticScore(homeStrength, awayStrength, factors);

        // Generate detailed analysis
        String analysisText = generateDetailedAnalysis(homeTeam, awayTeam, factors, probabilities);

        // Generate smart recommendation
        String recommendation = generateSmartRecommendation(probabilities, factors);

        // Calculate confidence based on multiple factors
        int confidence = calculateConfidence(factors, probabilities);

        // Add detailed analysis data
        analysis.put("confidence", confidence);
        analysis.put("predictedScore", predictedScore);
        analysis.put("analysis", analysisText);
        analysis.put("recommendation", recommendation);
        analysis.put("homeWinProbability", probabilities.get("homeWin"));
        analysis.put("drawProbability", probabilities.get("draw"));
        analysis.put("awayWinProbability", probabilities.get("awayWin"));
        analysis.put("keyFactors", factors.get("keyFactors"));
        analysis.put("riskLevel", factors.get("riskLevel"));
        analysis.put("alternativeRecommendation", factors.get("alternativeRecommendation"));

        return analysis;
    }

    /**
     * Calculate detailed factors affecting the match
     */
    private Map<String, Object> calculateDetailedFactors(String homeTeam, String awayTeam, int homeStrength,
            int awayStrength) {
        Map<String, Object> factors = new HashMap<>();
        Random random = new Random();

        // Recent form (last 5 matches simulation)
        double homeFormFactor = 0.8 + (random.nextDouble() * 0.4); // 0.8 - 1.2
        double awayFormFactor = 0.8 + (random.nextDouble() * 0.4);

        // Injury factor (simulation)
        double homeInjuryFactor = 0.9 + (random.nextDouble() * 0.2); // 0.9 - 1.1
        double awayInjuryFactor = 0.9 + (random.nextDouble() * 0.2);

        // Weather factor (simulation)
        double weatherFactor = 0.95 + (random.nextDouble() * 0.1); // 0.95 - 1.05

        // Motivation factor (derby, relegation, etc.)
        double motivationFactor = calculateMotivationFactor(homeTeam, awayTeam);

        // Key factors list
        List<String> keyFactors = new ArrayList<>();
        if (homeFormFactor > 1.1)
            keyFactors.add("Phong độ tốt của " + homeTeam);
        if (awayFormFactor > 1.1)
            keyFactors.add("Phong độ tốt của " + awayTeam);
        if (homeInjuryFactor < 0.95)
            keyFactors.add("Chấn thương quan trọng ở " + homeTeam);
        if (awayInjuryFactor < 0.95)
            keyFactors.add("Chấn thương quan trọng ở " + awayTeam);
        if (motivationFactor > 1.1)
            keyFactors.add("Động lực cao cho trận đấu");

        // Risk level calculation
        String riskLevel = calculateRiskLevel(homeStrength, awayStrength, homeFormFactor, awayFormFactor);

        // Alternative recommendation
        String alternativeRecommendation = generateAlternativeRecommendation(homeStrength, awayStrength);

        factors.put("homeFormFactor", homeFormFactor);
        factors.put("awayFormFactor", awayFormFactor);
        factors.put("homeInjuryFactor", homeInjuryFactor);
        factors.put("awayInjuryFactor", awayInjuryFactor);
        factors.put("weatherFactor", weatherFactor);
        factors.put("motivationFactor", motivationFactor);
        factors.put("keyFactors", keyFactors);
        factors.put("riskLevel", riskLevel);
        factors.put("alternativeRecommendation", alternativeRecommendation);

        return factors;
    }

    /**
     * Calculate home advantage based on team characteristics
     */
    private int calculateHomeAdvantage(String homeTeam, String awayTeam) {
        // Big teams have less home advantage, smaller teams have more
        Map<String, Integer> homeAdvantageMap = new HashMap<>();
        homeAdvantageMap.put("Manchester City", 3);
        homeAdvantageMap.put("Arsenal", 4);
        homeAdvantageMap.put("Liverpool", 4);
        homeAdvantageMap.put("Manchester United", 5);
        homeAdvantageMap.put("Chelsea", 5);
        homeAdvantageMap.put("Tottenham Hotspur", 6);
        homeAdvantageMap.put("Newcastle United", 7);
        homeAdvantageMap.put("Brighton & Hove Albion", 8);

        return homeAdvantageMap.getOrDefault(homeTeam, 6);
    }

    /**
     * Calculate head-to-head factor
     */
    private int calculateHeadToHeadFactor(String homeTeam, String awayTeam) {
        // Simulate head-to-head records
        Random random = new Random();
        int factor = random.nextInt(7) - 3; // -3 to +3
        return factor;
    }

    /**
     * Calculate probabilities with sophisticated algorithm
     */
    private Map<String, Integer> calculateProbabilities(int homeStrength, int awayStrength,
            Map<String, Object> factors) {
        Map<String, Integer> probabilities = new HashMap<>();

        // Base calculation
        int totalStrength = homeStrength + awayStrength;
        int homeWin = (homeStrength * 100) / totalStrength;
        int awayWin = (awayStrength * 100) / totalStrength;
        int draw = 100 - homeWin - awayWin;

        // Apply factors
        double homeFormFactor = (Double) factors.get("homeFormFactor");
        double awayFormFactor = (Double) factors.get("awayFormFactor");
        double motivationFactor = (Double) factors.get("motivationFactor");

        homeWin = (int) (homeWin * homeFormFactor * motivationFactor);
        awayWin = (int) (awayWin * awayFormFactor * motivationFactor);

        // Normalize to 100%
        int total = homeWin + awayWin + draw;
        if (total > 0) {
            homeWin = (homeWin * 100) / total;
            awayWin = (awayWin * 100) / total;
            draw = 100 - homeWin - awayWin;
        }

        // Ensure realistic ranges
        homeWin = Math.max(10, Math.min(80, homeWin));
        awayWin = Math.max(10, Math.min(80, awayWin));
        draw = Math.max(15, Math.min(40, draw));

        probabilities.put("homeWin", homeWin);
        probabilities.put("awayWin", awayWin);
        probabilities.put("draw", draw);

        return probabilities;
    }

    /**
     * Generate realistic score prediction
     */
    private String generateRealisticScore(int homeStrength, int awayStrength, Map<String, Object> factors) {
        Random random = new Random();

        // Base goals calculation
        double homeGoalRate = (homeStrength / 100.0) * 2.5; // Average 2.5 goals for top teams
        double awayGoalRate = (awayStrength / 100.0) * 2.0; // Average 2.0 goals for top teams

        // Apply form factors
        double homeFormFactor = (Double) factors.get("homeFormFactor");
        double awayFormFactor = (Double) factors.get("awayFormFactor");

        homeGoalRate *= homeFormFactor;
        awayGoalRate *= awayFormFactor;

        // Poisson distribution simulation
        int homeGoals = simulatePoisson(homeGoalRate, random);
        int awayGoals = simulatePoisson(awayGoalRate, random);

        // Ensure realistic scores (0-5 goals)
        homeGoals = Math.min(5, Math.max(0, homeGoals));
        awayGoals = Math.min(5, Math.max(0, awayGoals));

        return homeGoals + "-" + awayGoals;
    }

    /**
     * Simulate Poisson distribution for goal scoring
     */
    private int simulatePoisson(double lambda, Random random) {
        double L = Math.exp(-lambda);
        double p = 1.0;
        int k = 0;

        do {
            k++;
            p *= random.nextDouble();
        } while (p > L);

        return k - 1;
    }

    /**
     * Generate detailed analysis text
     */
    private String generateDetailedAnalysis(String homeTeam, String awayTeam, Map<String, Object> factors,
            Map<String, Integer> probabilities) {
        StringBuilder analysis = new StringBuilder();

        int homeWin = probabilities.get("homeWin");
        int draw = probabilities.get("draw");
        int awayWin = probabilities.get("awayWin");

        @SuppressWarnings("unchecked")
        List<String> keyFactors = (List<String>) factors.get("keyFactors");

        if (homeWin > 50) {
            analysis.append(homeTeam).append(" có lợi thế rõ ràng với ").append(homeWin).append("% cơ hội thắng");
        } else if (awayWin > 45) {
            analysis.append(awayTeam).append(" có phong độ tốt hơn với ").append(awayWin).append("% cơ hội thắng");
        } else if (draw > 35) {
            analysis.append("Trận đấu cân bằng với ").append(draw).append("% khả năng hòa");
        } else {
            analysis.append("Trận đấu khó đoán, cả hai đội đều có cơ hội");
        }

        if (!keyFactors.isEmpty()) {
            analysis.append(". ").append(String.join(", ", keyFactors));
        }

        return analysis.toString();
    }

    /**
     * Generate smart recommendation based on probabilities and factors
     */
    private String generateSmartRecommendation(Map<String, Integer> probabilities, Map<String, Object> factors) {
        int homeWin = probabilities.get("homeWin");
        int draw = probabilities.get("draw");
        int awayWin = probabilities.get("awayWin");
        String riskLevel = (String) factors.get("riskLevel");

        if (homeWin > 60) {
            return "Đội nhà thắng " + (homeWin > 70 ? "(Rất chắc chắn)" : "(Khá chắc chắn)");
        } else if (awayWin > 55) {
            return "Đội khách thắng " + (awayWin > 65 ? "(Rất chắc chắn)" : "(Khá chắc chắn)");
        } else if (draw > 40) {
            return "Hòa " + (draw > 45 ? "(Rất chắc chắn)" : "(Khá chắc chắn)");
        } else if (homeWin > 45 && awayWin > 35) {
            return "Cả hai đội đều ghi bàn";
        } else {
            return "Trận đấu có nhiều bàn thắng (>2 bàn)";
        }
    }

    /**
     * Calculate confidence level
     */
    private int calculateConfidence(Map<String, Object> factors, Map<String, Integer> probabilities) {
        int homeWin = probabilities.get("homeWin");
        int draw = probabilities.get("draw");
        int awayWin = probabilities.get("awayWin");

        // Base confidence on probability spread
        int maxProb = Math.max(homeWin, Math.max(draw, awayWin));
        int confidence = 50 + (maxProb - 33); // 50-84 base

        // Adjust based on factors
        @SuppressWarnings("unchecked")
        List<String> keyFactors = (List<String>) factors.get("keyFactors");
        confidence += keyFactors.size() * 2; // More factors = more confidence

        // Risk level adjustment
        String riskLevel = (String) factors.get("riskLevel");
        if ("Thấp".equals(riskLevel))
            confidence += 10;
        else if ("Cao".equals(riskLevel))
            confidence -= 15;

        return Math.max(60, Math.min(95, confidence));
    }

    /**
     * Calculate motivation factor
     */
    private double calculateMotivationFactor(String homeTeam, String awayTeam) {
        // Derby matches have higher motivation
        if (isDerbyMatch(homeTeam, awayTeam)) {
            return 1.15;
        }

        // Big team vs small team
        if (isBigTeam(homeTeam) && !isBigTeam(awayTeam)) {
            return 0.95; // Big team might be less motivated
        }

        return 1.0; // Normal motivation
    }

    /**
     * Check if it's a derby match
     */
    private boolean isDerbyMatch(String team1, String team2) {
        String[][] derbies = {
                { "Manchester United", "Manchester City" },
                { "Arsenal", "Tottenham Hotspur" },
                { "Liverpool", "Everton" },
                { "Chelsea", "Arsenal" },
                { "Newcastle United", "Sunderland" }
        };

        for (String[] derby : derbies) {
            if ((derby[0].equals(team1) && derby[1].equals(team2)) ||
                    (derby[0].equals(team2) && derby[1].equals(team1))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if team is a big team
     */
    private boolean isBigTeam(String team) {
        String[] bigTeams = { "Manchester City", "Arsenal", "Liverpool", "Manchester United", "Chelsea",
                "Tottenham Hotspur" };
        for (String bigTeam : bigTeams) {
            if (bigTeam.equals(team))
                return true;
        }
        return false;
    }

    /**
     * Calculate risk level
     */
    private String calculateRiskLevel(int homeStrength, int awayStrength, double homeForm, double awayForm) {
        int strengthDiff = Math.abs(homeStrength - awayStrength);
        double formDiff = Math.abs(homeForm - awayForm);

        if (strengthDiff < 10 && formDiff < 0.1) {
            return "Cao"; // Very close match
        } else if (strengthDiff < 20 && formDiff < 0.2) {
            return "Trung Bình";
        } else {
            return "Thấp"; // Clear favorite
        }
    }

    /**
     * Generate alternative recommendation
     */
    private String generateAlternativeRecommendation(int homeStrength, int awayStrength) {
        if (homeStrength > awayStrength + 15) {
            return "Trận đấu có nhiều bàn thắng (>2 bàn)";
        } else if (awayStrength > homeStrength + 10) {
            return "Cả hai đội đều ghi bàn";
        } else {
            return "Trận đấu ít bàn thắng (<2 bàn)";
        }
    }

    private String generatePredictedScore(int homeStrength, int awayStrength) {
        Random random = new Random();

        int homeGoals = (homeStrength / 30) + random.nextInt(2);
        int awayGoals = (awayStrength / 35) + random.nextInt(2);

        // Ensure realistic scores
        homeGoals = Math.min(4, Math.max(0, homeGoals));
        awayGoals = Math.min(4, Math.max(0, awayGoals));

        return homeGoals + "-" + awayGoals;
    }

    private String generateAnalysisText(String homeTeam, String awayTeam, int homeStrength, int awayStrength) {
        if (homeStrength > awayStrength + 10) {
            return homeTeam + " có lợi thế lớn với phong độ tốt và sân nhà";
        } else if (awayStrength > homeStrength + 5) {
            return awayTeam + " có phong độ ấn tượng, có thể thắng dù chơi sân khách";
        } else {
            return "Trận đấu cân bằng, cả hai đội có cơ hội chiến thắng";
        }
    }

    private String generateRecommendation(int homeWin, int draw, int awayWin) {
        if (homeWin > 50)
            return "Đội nhà thắng";
        if (awayWin > 45)
            return "Đội khách thắng";
        if (draw > 35)
            return "Hòa";
        return "Cả hai đội đều ghi bàn";
    }

    /**
     * Fallback matches với AI predictions
     */
    private List<Map<String, Object>> getFallbackMatchesWithPredictions() {
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
            match.put("date", "2024-09-" + (15 + i));
            match.put("time", (19 + i) + ":30");
            match.put("competition", "Premier League");
            match.put("homeTeamLogo", "/user/images/team-default.png");
            match.put("awayTeamLogo", "/user/images/team-default.png");

            // Add AI predictions
            enhanceWithAIPrediction(match);

            matches.add(match);
        }

        return matches;
    }
}