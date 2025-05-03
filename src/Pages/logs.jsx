import "../../src/CSS/dashboard.css";
import Table from "../components/Table";
import { useTranslation } from 'react-i18next';
import { fetchLogs } from '../utils/api'; // you should have a function to fetch logs
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns'; // Import date-fns format function

const Logs = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    const getLogs = async () => {
      setLoadingLogs(true);
      const data = await fetchLogs();
      // Format the created_at date before setting the logs
      const formattedLogs = data.map(log => ({
        ...log,
        created_at: format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss') // Format date here
      }));
      setLogs(formattedLogs || []);
      setLoadingLogs(false);
    };
    getLogs();
  }, []);

  const columns = [
    // { label: t("Staff ID"), key: "s_id" },
    { label: t("staff_email"), key: "staff_email" },
    { label: t("message"), key: "message" },
    { label: t("date_and_time"), key: "created_at" }
  ];

  return (
    <div className="dashboard-page">
      {/* Logs Table */}
      <div className="recent-transactions-container">
        {loadingLogs ? (
          <div className="loader" />
        ) : (
          <Table
            columns={columns}
            data={logs}
            showActions={false}
            title={t("logs")}
            loading={loadingLogs}
          />
        )}
      </div>
    </div>
  );
};

export default Logs;