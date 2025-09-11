import React, { useState } from "react";
import "./reminder.css";

export const Reminder = () => {
  const [openTomorrow, setOpenTomorrow] = useState(false);

  return (
    <div className="reminder-card">
      <h2>💊 یادآوری دارو</h2>

      {/* امروز */}
      <div className="reminder-section open">
        <h3>امروز</h3>
        <ul>
          <li>
            <div className="reminder-info">
              <strong>انسولین</strong> - 1 واحد
              <span className="note">قبل از صبحانه</span>
            </div>
            <input type="checkbox" className="check" />
          </li>
          <li>
            <div className="reminder-info">
              <strong>متفورمین</strong> - 2 قرص
              <span className="note">بعد از ناهار</span>
            </div>
            <input type="checkbox" className="check" />
          </li>
        </ul>
      </div>

      {/* فردا */}
      <div
        className={`reminder-section collapsible ${openTomorrow ? "open" : ""}`}
      >
        <h3 className="toggle" onClick={() => setOpenTomorrow(!openTomorrow)}>
          فردا
        </h3>
        {openTomorrow && (
          <ul className="content">
            <li>
              <div className="reminder-info">
                <strong>ویتامین D</strong> - 1 کپسول
                <span className="note">بعد از شام</span>
              </div>
              <input type="checkbox" className="check" />
            </li>
            <li>
              <div className="reminder-info">
                <strong>انسولین</strong> - 1 واحد
                <span className="note">صبح زود</span>
              </div>
              <input type="checkbox" className="check" />
            </li>
          </ul>
        )}
      </div>

      <button className="next-day">روزهای بعدی ⮜ </button>
    </div>
  );
};

