import React, { useState, useEffect } from "react";
import { useCharity } from "../hooks/useCharity";
import { Bar } from "react-chartjs-2";

export default function Metrics() {
  const { contract } = useCharity();
  const [data, setData] = useState({});

  const load = async () => {
    const [total, count, highest, avg] = await contract.getCampaignMetrics(1);

    setData({
      labels: ["Total", "Count", "Highest", "Average"],
      datasets: [
        {
          label: "Campaign Metrics (wei)",
          data: [
            total.toString(),
            count.toString(),
            highest.toString(),
            avg.toString(),
          ],
        },
      ],
    });
  };

  useEffect(() => {
    if (contract) load();
  }, [contract]);

  return (
    <div className="p-4">
      <h2 className="text-xl">Campaign Metrics</h2>
      <Bar data={data} />
    </div>
  );
}
