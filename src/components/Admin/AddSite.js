import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosConfig';

function AddSite() {
  const [siteName, setSiteName] = useState('');
  const [sites, setSites] = useState([]);
  const [editingSite, setEditingSite] = useState(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/sites');
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites', error);
      alert(`Failed to fetch sites: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/admin/sites', { name: siteName });
      
      if (response.data) {
        // Add new site to the list
        setSites([...sites, response.data.site]);
        // Clear input
        setSiteName('');
        alert('Site added successfully');
      }
    } catch (error) {
      console.error('Error adding site', error);
      alert(`Failed to add site: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditSite = (site) => {
    setEditingSite({...site});
  };

  const handleUpdateSite = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/api/admin/sites/${editingSite._id}`, 
        { name: editingSite.name }
      );

      if (response.data) {
        // Update sites list
        const updatedSites = sites.map(site => 
          site._id === editingSite._id ? response.data.site : site
        );
        setSites(updatedSites);
        // Reset editing state
        setEditingSite(null);
        alert('Site updated successfully');
      }
    } catch (error) {
      console.error('Error updating site', error);
      alert(`Failed to update site: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteSite = async (siteId) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;

    try {
      const response = await axiosInstance.delete(`/api/admin/sites/${siteId}`);

      if (response.data) {
        // Remove the deleted site from the list
        const updatedSites = sites.filter(site => site._id !== siteId);
        setSites(updatedSites);
        alert('Site deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting site', error);
      alert(`Failed to delete site: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="add-site">
      <h3>Add/Manage Sites</h3>
      {editingSite ? (
        <form onSubmit={handleUpdateSite}>
          <input 
            type="text" 
            placeholder="Site Name" 
            value={editingSite.name}
            onChange={(e) => setEditingSite({...editingSite, name: e.target.value})}
            required 
          />
          <button type="submit">Update Site</button>
          <button type="button" onClick={() => setEditingSite(null)}>Cancel</button>
        </form>
      ) : (
        <form onSubmit={handleAddSite}>
          <input 
            type="text" 
            placeholder="Site Name" 
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            required 
          />
          <button type="submit">Add Site</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Site Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site._id}>
              <td>{site.name}</td>
              <td>
                <button onClick={() => handleEditSite(site)}>Edit</button>
                <button onClick={() => handleDeleteSite(site._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AddSite;
