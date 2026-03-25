import React, { useEffect, useState } from "react";
import { fetchFootballTest } from '../../../service/user/home/footballTestApi';

type Match = {
  date: string;
  awayWinProbability: number;
  venue: string;
  awayTeam: string;
  competition: string;
  homeTeam: string;
  id: number;
  time: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  drawProbability: number;
  homeWinProbability: number;
  status: string;
  predictedScore?: string;
  aiConfidence?: number;
  aiAnalysis?: string;
  recommendation?: string;
};

type ApiStatus = {
  season?: string;
  competition?: string;
  message: string;
  status: string;
};

type ApiResponse = {
  realMatches?: Match[];
  aiMatches?: Match[];
  message?: string;
  apiStatus?: ApiStatus;
  error?: string;
};

const FootballTestPage: React.FC = () => {
  const [data, setData] = useState<ApiResponse>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFootballTest()
      .then((d) => setData(d))
      .catch((e) => setData({ error: String(e) }))
      .finally(() => setLoading(false));

    // Auto-refresh every 30 seconds
    const timer = setTimeout(() => window.location.reload(), 30000);
    return () => clearTimeout(timer);
  }, []);

  const now = new Date().toLocaleString();

  return (
    <div className="container" style={{ padding: 20, fontFamily: "'Courier New', monospace" }}>
      <h1>🧪 Football API Test Page</h1>
      <p className="lead">{data.message || "Testing Football-Data.org Integration"}</p>

      <a href="/sportify/football-prediction" className="btn btn-primary mb-4">
        ← Back to Predictions
      </a>

      {/* API Status */}
      <div className="row">
        <div className="col-md-12">
          <h3>📡 API Connection Status</h3>
          {data.apiStatus && (
            <div
              className={
                "api-status " +
                (data.apiStatus.status === "SUCCESS" ? "success" : "error")
              }
              style={{
                margin: "10px 0",
                padding: 15,
                borderRadius: 5,
                background: data.apiStatus.status === "SUCCESS" ? "#d4edda" : "#f8d7da",
                border: "1px solid " + (data.apiStatus.status === "SUCCESS" ? "#c3e6cb" : "#f5c6cb"),
                color: data.apiStatus.status === "SUCCESS" ? "#155724" : "#721c24",
              }}
            >
              <h5>{data.apiStatus.status}</h5>
              <p>{data.apiStatus.message}</p>
              {data.apiStatus.competition && (
                <div>
                  <strong>Competition:</strong> {data.apiStatus.competition}
                  <br />
                  <strong>Season:</strong> {data.apiStatus.season || "N/A"}
                </div>
              )}
            </div>
          )}
          {data.error && (
            <div className="alert alert-danger">
              <h5>❌ Error Occurred</h5>
              <p>{data.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Raw API Data */}
      {data.realMatches && (
        <div className="row mt-4">
          <div className="col-md-12">
            <h3>⚽ Raw API Matches</h3>
            <p>Direct data from Football-Data.org API:</p>
            {data.realMatches.map((match, i) => (
              <div key={match.id || i} className="match-item" style={{ border: "1px solid #ddd", margin: "10px 0", padding: 15, borderRadius: 5 }}>
                <h6>
                  {match.homeTeam} vs {match.awayTeam}
                </h6>
                <p>
                  <strong>Date:</strong> {match.date}
                  <br />
                  <strong>Time:</strong> {match.time}
                  <br />
                  <strong>Competition:</strong> {match.competition}
                  <br />
                  <strong>Venue:</strong> {match.venue || "TBA"}
                  <br />
                  <strong>Status:</strong> {match.status}
                </p>
                <details>
                  <summary>🔍 Raw JSON Data</summary>
                  <div className="json-data" style={{ background: "#f8f9fa", padding: 10, borderRadius: 3, maxHeight: 300, overflowY: "auto" }}>
                    <pre>{JSON.stringify(match, null, 2)}</pre>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Enhanced Data */}
      {data.aiMatches && (
        <div className="row mt-4">
          <div className="col-md-12">
            <h3>🧠 AI Enhanced Matches</h3>
            <p>API data enhanced with AI predictions:</p>
            {data.aiMatches.map((match, i) => (
              <div key={match.id || i} className="match-item" style={{ border: "1px solid #ddd", margin: "10px 0", padding: 15, borderRadius: 5 }}>
                <h6>
                  {match.homeTeam} vs {match.awayTeam}
                </h6>
                <p>
                  <strong>Date:</strong> {match.date}
                  <br />
                  <strong>Time:</strong> {match.time}
                  <br />
                  <strong>AI Predicted Score:</strong>{" "}
                  <span className="text-success">{match.predictedScore || "N/A"}</span>
                  <br />
                  <strong>AI Confidence:</strong>{" "}
                  <span className="text-info">{match.aiConfidence || "N/A"}</span>%
                  <br />
                  <strong>Analysis:</strong> {match.aiAnalysis || "N/A"}
                  <br />
                  <strong>Recommendation:</strong>{" "}
                  <span className="text-warning">{match.recommendation || "N/A"}</span>
                </p>
                <div className="row">
                  <div className="col-4 text-center">
                    <small>Home Win</small>
                    <br />
                    <span className="badge badge-success">
                      {match.homeWinProbability}%
                    </span>
                  </div>
                  <div className="col-4 text-center">
                    <small>Draw</small>
                    <br />
                    <span className="badge badge-warning">
                      {match.drawProbability}%
                    </span>
                  </div>
                  <div className="col-4 text-center">
                    <small>Away Win</small>
                    <br />
                    <span className="badge badge-success">
                      {match.awayWinProbability}%
                    </span>
                  </div>
                </div>
                <details className="mt-2">
                  <summary>🔍 Enhanced JSON Data</summary>
                  <div className="json-data" style={{ background: "#f8f9fa", padding: 10, borderRadius: 3, maxHeight: 300, overflowY: "auto" }}>
                    <pre>{JSON.stringify(match, null, 2)}</pre>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Actions */}
      <div className="row mt-4">
        <div className="col-md-12">
          <h3>🛠️ Test Actions</h3>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            🔄 Refresh Data
          </button>
          <a href="/sportify/football-prediction" className="btn btn-success">
            ✅ Go to Production Page
          </a>
          <button
            onClick={() =>
              window.open(
                "https://api.football-data.org/v4/competitions/2021/matches?status=SCHEDULED",
                "_blank"
              )
            }
            className="btn btn-info"
          >
            📡 View Raw API
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="row mt-4">
        <div className="col-md-12">
          <h3>🐛 Debug Information</h3>
          <div className="json-data" style={{ background: "#f8f9fa", padding: 10, borderRadius: 3 }}>
            <strong>API Key (last 4 chars):</strong> ...c21
            <br />
            <strong>Base URL:</strong> https://api.football-data.org/v4
            <br />
            <strong>Endpoint:</strong> /competitions/2021/matches?status=SCHEDULED
            <br />
            <strong>League:</strong> Premier League (ID: 2021)
            <br />
            <strong>Current Time:</strong> {now}
            <br />
          </div>
        </div>
      </div>
      {loading && <div className="mt-4 alert alert-info">Loading...</div>}
    </div>
  );
};

export default FootballTestPage;
