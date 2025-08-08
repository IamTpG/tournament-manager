import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import LoginPage                from "./pages/Login";

import Home                     from "./pages/Home";
import News                     from "./pages/News";
import Highlights               from "./pages/Highlights";

import Tournaments              from "./pages/Tournaments";
import CreateTournament         from "./pages/CreateTournament";
import TournamentDetail         from './pages/TournamentDetail';
import TournamentDetail_Matches from './pages/TournamentDetail_Matches';
import TournamentDetailBracket  from "./pages/TournamentDetail_Bracket";
import MatchEditPage            from "./pages/EditMatch";
import EditTournamentPage       from "./pages/EditTournament";
import MatchDetail              from "./pages/MatchDetail";

import RegisterUser             from "./pages/RegisterUser";
import MemberApproval           from "./pages/MemberApproval";

import AdminRoute from "./components/AdminRoute";

import "./styles.css";

export default function App() {
  const token = localStorage.getItem("jwtToken");

  return (
    <Router>
      <div>
        <header>
          <div className="logo">TournaX</div>

          <nav>
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Trang chủ</NavLink>
            <NavLink to="/news" className={({ isActive }) => (isActive ? "active" : "")}>Bản tin</NavLink>
            <NavLink to="/highlights" className={({ isActive }) => (isActive ? "active" : "")}>Highlights</NavLink>
            <NavLink to="/tournaments" className={({ isActive }) => (isActive ? "active" : "")}>Giải đấu</NavLink>
            {token && (
              <>
                <NavLink to="/create-tournament" className={({ isActive }) => (isActive ? "active" : "")}>Tạo giải đấu</NavLink>
                <NavLink to="/admin/members" className={({ isActive }) => (isActive ? "active" : "")}>Duyệt thành viên</NavLink>  
              </>
            )}  
          </nav>

          <div className="search">
            <input type="text" placeholder="Tìm kiếm" />
            <NavLink
              to="/login"
              className="user-icon"
              onClick={() => {
                if (token) {
                  localStorage.removeItem("jwtToken");
                  window.location.reload();
                } else {
                  navigate("/login");
                }
              }}
              style={{ cursor: "pointer" }}
            >
            {token ? "🚪" : "👤"}
            </NavLink>
          </div>
        </header>



        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/news" element={<News />} />
          <Route path="/highlights" element={<Highlights />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournament/:tournament_id" element={<TournamentDetail />} />
          <Route path="/tournament/:tournament_id/matches" element={<TournamentDetail_Matches/>} />
          <Route path="/tournament/:tournament_id/rank" element={<TournamentDetailBracket />} />
          <Route path="/tournament/:tournament_id/matches/:matchId" element={<MatchDetail />} />
          <Route path="/tournament/:tournamentId/register" element={<RegisterUser />} />
          
          <Route
            path="/admin/members"
            element={
              <AdminRoute>
                <MemberApproval />
              </AdminRoute>
            }
          />

          <Route
            path="/create-tournament"
            element={
              <AdminRoute>
                <CreateTournament />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tournament/:id/edit"
            element={
              <AdminRoute>
                <EditTournamentPage />
              </AdminRoute>
            }
          />
          <Route
            path="/tournament/:id/matches/:matchId/edit"
            element={
              <AdminRoute>
                <MatchEditPage />
              </AdminRoute>
            }
          />

          {/* <Route path="/create-tournament" element={<CreateTournament />} />
          <Route path="/admin/tournament/:id/edit" element={<EditTournamentPage />} />
          <Route path="/tournament/:id/matches/:matchId/edit" element={<MatchEditPage />} /> */}
        </Routes>



        <footer>
          <div className="footer-container">
            <div className="footer-logo">🎮</div>
            <div className="footer-info">
              <strong>ABOUT US</strong>
            </div>
            <div className="footer-info">
              <strong>CONTACT</strong>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
