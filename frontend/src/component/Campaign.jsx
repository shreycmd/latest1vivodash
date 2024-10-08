import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const Campaign = () => {
  const [formData, setFormData] = useState({
    campaignName: '',
    description: '',
    type: '',
    startDate: new Date(),
    endDate: new Date(),
    selectedProducts: [],
    fortuneWheel: false,
    scratchCard: false,
  });

  const [prizes, setPrizes] = useState([{ prize: '', quantity: 0 }]);
  const [scratchCardPrizes, setScratchCardPrizes] = useState([{ prize: '', quantity: 0 }]);
  const [productOptions, setProductOptions] = useState([]);
  const [table, setTable] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/product');
        const result = await response.json();
        if (response.ok) {
          const options = result.data.map(product => ({
            value: product._id,
            label: product.Name
          }));
          setProductOptions(options);
        } else {
          console.error('Error fetching products:', result.message);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('http://localhost:3000/campaign');
        const res = await response.json();
        if (response.ok) {
          setTable(res.data);
        } else {
          console.error('Error fetching campaigns:', res.message);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchCampaigns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleSelectChange = (selectedOptions, field) => {
    setFormData({ ...formData, [field]: selectedOptions });
  };

  const handlePrizeChange = (index, field, value) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index][field] = value;
    setPrizes(updatedPrizes);
  };

  const handleScratchCardPrizeChange = (index, field, value) => {
    const updatedScratchCardPrizes = [...scratchCardPrizes];
    updatedScratchCardPrizes[index][field] = value;
    setScratchCardPrizes(updatedScratchCardPrizes);
  };

  const addPrize = () => {
    setPrizes([...prizes, { prize: '', quantity: 0 }]);
  };

  const addScratchCardPrize = () => {
    setScratchCardPrizes([...scratchCardPrizes, { prize: '', quantity: 0 }]);
  };

  const removePrize = (index) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const removeScratchCardPrize = (index) => {
    setScratchCardPrizes(scratchCardPrizes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const products = formData.selectedProducts.map(option => option.value);

    try {
      const response = await fetch('http://localhost:3000/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: formData.campaignName,
          Desc: formData.description,
          Prize_type: formData.type,
          Start_date: formData.startDate.toISOString(),
          End_date: formData.endDate.toISOString(),
          Products: products,
          FortuneWheel: formData.fortuneWheel,
          ScratchCard: formData.scratchCard,
          WheelPrizes: formData.fortuneWheel ? prizes : [],
          Scratchprize: formData.scratchCard ? scratchCardPrizes : []
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setFormData({
          campaignName: '',
          description: '',
          type: '',
          startDate: new Date(),
          endDate: new Date(),
          selectedProducts: [],
          fortuneWheel: false,
          scratchCard: false,
        });
        setPrizes([{ prize: '', quantity: 0 }]);
        setScratchCardPrizes([{ prize: '', quantity: 0 }]);
      } else {
        throw new Error(result.message || 'Something went wrong');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex justify-between">
      <div className="p-4 w-2/5">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
          {/* Campaign Name */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Campaign Name:</label>
            <input
              type="text"
              name="campaignName"
              value={formData.campaignName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>

          {/* Type */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Type:</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
            >
              <option value="">Select Type</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Accessory">Accessory</option>
            </select>
          </div>

          {/* Fortune Wheel Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Do you want a Fortune Wheel?</label>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="fortuneWheel"
                  checked={formData.fortuneWheel}
                  onChange={() => setFormData({ ...formData, fortuneWheel: true })}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input
                  type="radio"
                  name="fortuneWheel"
                  checked={!formData.fortuneWheel}
                  onChange={() => setFormData({ ...formData, fortuneWheel: false })}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>

          {/* Prize & Quantity Section for Fortune Wheel */}
          {formData.fortuneWheel && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Prizes (Fortune Wheel):</label>
              {prizes.map((prize, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder="Prize Name"
                    value={prize.prize}
                    onChange={(e) => handlePrizeChange(index, 'prize', e.target.value)}
                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg shadow-sm mr-2"
                  />
                  <button
                    type="button"
                    onClick={() => removePrize(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPrize}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Add Prize
              </button>
            </div>
          )}

          {/* Scratch Card Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Do you want a Scratch Card?</label>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="scratchCard"
                  checked={formData.scratchCard}
                  onChange={() => setFormData({ ...formData, scratchCard: true })}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center ml-4">
                <input
                  type="radio"
                  name="scratchCard"
                  checked={!formData.scratchCard}
                  onChange={() => setFormData({ ...formData, scratchCard: false })}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>

          {/* Prize & Quantity Section for Scratch Card */}
          {formData.scratchCard && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Prizes (Scratch Card):</label>
              {scratchCardPrizes.map((prize, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder="Prize Name"
                    value={prize.prize}
                    onChange={(e) => handleScratchCardPrizeChange(index, 'prize', e.target.value)}
                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg shadow-sm mr-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeScratchCardPrize(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addScratchCardPrize}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Add Prize
              </button>
            </div>
          )}

          {/* Products Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Select Products:</label>
            <Select
              isMulti
              options={productOptions}
              value={formData.selectedProducts}
              onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'selectedProducts')}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>

          {/* Start and End Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Start Date:</label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => handleDateChange(date, 'startDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">End Date:</label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => handleDateChange(date, 'endDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Create Campaign
          </button>
        </form>
      </div>

      {/* Campaigns Table */}
      <div className="p-4 w-3/5 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Campaigns</h2>
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Campaign Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>

              <th className="border border-gray-300 px-4 py-2">Start Date</th>
              <th className="border border-gray-300 px-4 py-2">End Date</th>
              <th className="border border-gray-300 px-4 py-2">Prizes</th>
            </tr>
          </thead>
          <tbody>
            {table.map((campaign, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{campaign.Name}</td>
                <td className="border border-gray-300 px-4 py-2">{campaign.Desc}</td>
               
                <td className="border border-gray-300 px-4 py-2">{new Date(campaign.Start_date).toLocaleDateString()}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(campaign.End_date).toLocaleDateString()}</td>
                <td className="border border-gray-300 px-4 py-2">
                <div>
                {campaign.FortuneWheel
                  ? campaign.WheelPrizes.map((p, i) => (
                      <span key={i} >
                        {p.prize+" "} 
                      </span>
                    ))
                  : 'No Fortune Wheel'}</div>
                  <div>
                {campaign.ScratchCard
                  ? campaign.Scratchprize.map((p, i) => (
                      <span key={i}>
                        {p.prize +" "} 
                      </span>
                    ))
                  : 'No Scratch Card'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Campaign;
