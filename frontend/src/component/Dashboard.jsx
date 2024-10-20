import React, { useEffect, useState, useCallback } from "react";
import Claimedproduct from "./Claimedproduct";
import useSessionStorage from "./useSessionStorage";
import fetchwithauth from "./token";

const Dashboard = () => {
  const [cmpname, setcmpname] = useState();
  const [campaigns, setCampaigns] = useState([]);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [summarizedCampaigns, setSummarizedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 30;

  const summarizeCampaigns = useCallback((campaignDetails) => {
    return campaignDetails.map(({ name, productCount, unclaimedCount }) => {
      const claimed = productCount - unclaimedCount;
      return {
        name,
        claimed,
        unclaimed: unclaimedCount,
        totalProducts: productCount,
      };
    });
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL+"/dashboard");
        const res = await response.json();

        if (response.ok) {
          setCampaigns(res.dashboard.campaignDetails);
          setTotalCampaigns(res.dashboard.totalCampaigns);
          const summary = summarizeCampaigns(res.dashboard.campaignDetails);
          setSummarizedCampaigns(summary);
        } else {
          throw new Error(res.message || "Error fetching campaigns");
        }
      } catch (error) {
        setError(error.message);
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [summarizeCampaigns]);

  const fetchCampaignData = async (cmpname, page) => {
    console.log(cmpname)
    setLoading(true);
    try {
      const response = await fetchwithauth(
        import.meta.env.VITE_BACKEND_URL+`/campaigndetails/${cmpname}?page=${page}&limit=${limit}`
      );
      console.log(response)
      const res = await response.json();

      if (response.ok) {
        setCampaignDetails(res.data);
        setTotalPages(res.totalPages); // Update total pages from the response
      } else {
        throw new Error(res.message || "Error fetching campaign details");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimedClick = (name) => {
    setcmpname(name);
    setPage(1); // Reset to page 1 when viewing a new campaign
    fetchCampaignData(name, 1);
  };

  const handleNextPage = (name) => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
      fetchCampaignData(name, page + 1);
    }
  };

  const handlePreviousPage = (name) => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
      fetchCampaignData(name, page - 1);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">

      <h1 className="text-lg font-bold mb-4">Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-md font-bold">Total Campaigns: {totalCampaigns}</h2>
      </div>
      <table className="min-w-full table-auto border-collapse shadow-lg bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="py-3 px-4 text-left">Campaign Name</th>
            <th className="py-3 px-4 text-left">Claimed Products</th>
            <th className="py-3 px-4 text-left">Unclaimed Products</th>
            <th className="py-3 px-4 text-left">Total Products</th>
          </tr>
        </thead>
        <tbody>
          {summarizedCampaigns.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-3 px-4">{item.name}</td>
              <td
                className="py-3 px-4 cursor-pointer text-blue-500 underline"
                onClick={() => handleClaimedClick(item.name)}
              >
                {item.claimed}
              </td>
              
              <td className="py-3 px-4">{item.unclaimed}</td>
              <td className="py-3 px-4">{item.totalProducts}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {campaignDetails && (
        <div className="mt-4">
          <Claimedproduct claimedProducts={campaignDetails} cmpname={cmpname} />
          <div className="flex justify-between mt-2">
            <button
              onClick={() => handlePreviousPage(cmpname)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handleNextPage(cmpname)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
