import axiosInstance from '../Components/axiosInstance';

/**
 * Get document turnaround analytics
 * @param {Object} filters - Filter options
 * @returns {Promise} Turnaround analytics data
 */
export const getTurnaroundAnalytics = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.divisionId) params.append('divisionId', filters.divisionId);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axiosInstance.get(
      `/api/analytics/turnaround?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching turnaround analytics:', error);
    throw error;
  }
};

/**
 * Get bottleneck analysis
 * @param {Object} filters - Filter options
 * @returns {Promise} Bottleneck analysis data
 */
export const getBottleneckAnalysis = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.divisionId) params.append('divisionId', filters.divisionId);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axiosInstance.get(
      `/api/analytics/bottlenecks?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching bottleneck analysis:', error);
    throw error;
  }
};

/**
 * Get staff productivity metrics
 * @param {Object} filters - Filter options
 * @returns {Promise} Productivity metrics data
 */
export const getProductivityMetrics = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.divisionId) params.append('divisionId', filters.divisionId);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axiosInstance.get(
      `/api/analytics/productivity?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching productivity metrics:', error);
    throw error;
  }
};

/**
 * Get document status distribution
 * @param {Object} filters - Filter options
 * @returns {Promise} Status distribution data
 */
export const getStatusDistribution = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.divisionId) params.append('divisionId', filters.divisionId);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);

    const response = await axiosInstance.get(
      `/api/analytics/status-distribution?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    throw error;
  }
};

/**
 * Get comprehensive dashboard data
 * @param {Object} filters - Filter options
 * @returns {Promise} All analytics data
 */
export const getDashboardData = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.divisionId) params.append('divisionId', filters.divisionId);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axiosInstance.get(
      `/api/analytics/dashboard?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
