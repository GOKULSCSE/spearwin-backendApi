# Job Attributes Frontend Implementation Guide

## Overview
This guide provides comprehensive instructions for implementing the Job Attributes management system in your frontend application. The system allows admins to manage 12 predefined categories and their associated attributes.

## Backend API Endpoints

### Base URL: `/job-attributes`

### Category Management Endpoints

#### 1. Get All Categories with Attributes
```http
GET /job-attributes/categories/with-attributes
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Categories with attributes retrieved successfully",
  "data": [
    {
      "id": "category_id",
      "name": "LANGUAGE_LEVEL",
      "displayName": "Language Level",
      "isActive": true,
      "sortOrder": 1,
      "attributes": [
        {
          "id": "attr_id",
          "name": "English",
          "categoryId": "category_id",
          "isActive": true,
          "sortOrder": 0
        }
      ]
    }
  ]
}
```

#### 2. Create New Category
```http
POST /job-attributes/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "NEW_CATEGORY",
  "displayName": "New Category",
  "isActive": true,
  "sortOrder": 13
}
```

#### 3. Update Category
```http
PATCH /job-attributes/categories/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "displayName": "Updated Category Name",
  "isActive": false
}
```

#### 4. Delete Category
```http
DELETE /job-attributes/categories/:id
Authorization: Bearer <admin_token>
```

### Attribute Management Endpoints

#### 1. Get Attributes by Category
```http
GET /job-attributes/by-category/:categoryId
Authorization: Bearer <admin_token>
```

#### 2. Create New Attribute
```http
POST /job-attributes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Attribute",
  "categoryId": "category_id",
  "isActive": true,
  "sortOrder": 0
}
```

#### 3. Bulk Create Attributes
```http
POST /job-attributes/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

[
  {
    "name": "Attribute 1",
    "categoryId": "category_id",
    "isActive": true,
    "sortOrder": 0
  },
  {
    "name": "Attribute 2",
    "categoryId": "category_id",
    "isActive": true,
    "sortOrder": 1
  }
]
```

#### 4. Update Attribute
```http
PATCH /job-attributes/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Attribute Name",
  "isActive": false
}
```

#### 5. Delete Attribute
```http
DELETE /job-attributes/:id
Authorization: Bearer <admin_token>
```

## Frontend Implementation

### 1. React Component Structure

```jsx
// components/JobAttributes/JobAttributesDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const JobAttributesDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('category'); // 'category' or 'attribute'
  const [form] = Form.useForm();

  // API Configuration
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const token = localStorage.getItem('admin_token');

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Fetch categories with attributes
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/job-attributes/categories/with-attributes`,
        axiosConfig
      );
      setCategories(response.data.data);
    } catch (error) {
      message.error('Failed to fetch categories');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new attribute
  const createAttribute = async (values) => {
    try {
      await axios.post(
        `${API_BASE}/job-attributes`,
        {
          ...values,
          categoryId: selectedCategory.id
        },
        axiosConfig
      );
      message.success('Attribute created successfully');
      fetchCategories();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create attribute');
      console.error('Error:', error);
    }
  };

  // Update attribute
  const updateAttribute = async (values, attributeId) => {
    try {
      await axios.patch(
        `${API_BASE}/job-attributes/${attributeId}`,
        values,
        axiosConfig
      );
      message.success('Attribute updated successfully');
      fetchCategories();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update attribute');
      console.error('Error:', error);
    }
  };

  // Delete attribute
  const deleteAttribute = async (attributeId) => {
    try {
      await axios.delete(
        `${API_BASE}/job-attributes/${attributeId}`,
        axiosConfig
      );
      message.success('Attribute deleted successfully');
      fetchCategories();
    } catch (error) {
      message.error('Failed to delete attribute');
      console.error('Error:', error);
    }
  };

  // Handle modal operations
  const showModal = (type, category = null, attribute = null) => {
    setModalType(type);
    setSelectedCategory(category);
    setIsModalVisible(true);
    
    if (attribute) {
      form.setFieldsValue(attribute);
    } else {
      form.resetFields();
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (modalType === 'attribute') {
        if (form.getFieldValue('id')) {
          updateAttribute(values, form.getFieldValue('id'));
        } else {
          createAttribute(values);
        }
      }
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="job-attributes-dashboard">
      <div className="page-header">
        <h1>Job Attributes</h1>
        <p>Manage job attribute categories and their values</p>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <Card
            key={category.id}
            title={category.displayName}
            className="category-card"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal('attribute', category)}
              >
                Add New
              </Button>
            }
          >
            <div className="attributes-list">
              {category.attributes.length === 0 ? (
                <p className="no-attributes">No attributes added yet</p>
              ) : (
                category.attributes.map(attribute => (
                  <div key={attribute.id} className="attribute-item">
                    <span className="attribute-name">{attribute.name}</span>
                    <div className="attribute-actions">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => showModal('attribute', category, attribute)}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteAttribute(attribute.id)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for creating/editing attributes */}
      <Modal
        title={modalType === 'attribute' ? 'Add New Attribute' : 'Add New Category'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText="Save"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          name="attributeForm"
        >
          <Form.Item
            name="name"
            label="Attribute Name"
            rules={[{ required: true, message: 'Please enter attribute name' }]}
          >
            <Input placeholder="Enter attribute name" />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="Sort Order"
            rules={[{ required: true, message: 'Please enter sort order' }]}
          >
            <Input type="number" placeholder="0" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JobAttributesDashboard;
```

### 2. CSS Styles

```css
/* styles/JobAttributes.css */
.job-attributes-dashboard {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #262626;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.category-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.category-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.category-card .ant-card-head {
  border-bottom: 1px solid #f0f0f0;
}

.category-card .ant-card-head-title {
  font-weight: 600;
  color: #262626;
}

.attributes-list {
  max-height: 300px;
  overflow-y: auto;
}

.attribute-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.attribute-item:last-child {
  border-bottom: none;
}

.attribute-name {
  flex: 1;
  color: #262626;
  font-size: 14px;
}

.attribute-actions {
  display: flex;
  gap: 4px;
}

.no-attributes {
  text-align: center;
  color: #8c8c8c;
  font-style: italic;
  padding: 20px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .job-attributes-dashboard {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .attribute-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .attribute-actions {
    align-self: flex-end;
  }
}
```

### 3. API Service Layer

```javascript
// services/jobAttributeService.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class JobAttributeService {
  constructor() {
    this.token = localStorage.getItem('admin_token');
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Category methods
  async getCategoriesWithAttributes() {
    const response = await axios.get(
      `${API_BASE}/job-attributes/categories/with-attributes`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async createCategory(categoryData) {
    const response = await axios.post(
      `${API_BASE}/job-attributes/categories`,
      categoryData,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async updateCategory(categoryId, categoryData) {
    const response = await axios.patch(
      `${API_BASE}/job-attributes/categories/${categoryId}`,
      categoryData,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async deleteCategory(categoryId) {
    const response = await axios.delete(
      `${API_BASE}/job-attributes/categories/${categoryId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  // Attribute methods
  async getAttributesByCategory(categoryId) {
    const response = await axios.get(
      `${API_BASE}/job-attributes/by-category/${categoryId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async createAttribute(attributeData) {
    const response = await axios.post(
      `${API_BASE}/job-attributes`,
      attributeData,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async bulkCreateAttributes(attributesData) {
    const response = await axios.post(
      `${API_BASE}/job-attributes/bulk`,
      attributesData,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async updateAttribute(attributeId, attributeData) {
    const response = await axios.patch(
      `${API_BASE}/job-attributes/${attributeId}`,
      attributeData,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async deleteAttribute(attributeId) {
    const response = await axios.delete(
      `${API_BASE}/job-attributes/${attributeId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }
}

export default new JobAttributeService();
```

### 4. Usage in Admin Dashboard

```jsx
// pages/Admin/JobAttributes.jsx
import React from 'react';
import { Layout } from 'antd';
import JobAttributesDashboard from '../../components/JobAttributes/JobAttributesDashboard';

const { Content } = Layout;

const JobAttributesPage = () => {
  return (
    <Layout>
      <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
        <JobAttributesDashboard />
      </Content>
    </Layout>
  );
};

export default JobAttributesPage;
```

### 5. Route Configuration

```jsx
// App.js or your routing file
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JobAttributesPage from './pages/Admin/JobAttributes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/job-attributes" element={<JobAttributesPage />} />
        {/* other routes */}
      </Routes>
    </Router>
  );
}
```

## Setup Instructions

### 1. Initialize Database Categories

Run the initialization script to create the 12 default categories:

```bash
node initialize-job-attributes.js
```

### 2. Environment Variables

Make sure your frontend has the correct API URL:

```env
REACT_APP_API_URL=http://localhost:3000
```

### 3. Authentication

Ensure your admin authentication is working and the token is stored in localStorage as `admin_token`.

## Features Implemented

✅ **Category Management**
- View all 12 predefined categories
- Each category can have multiple attributes
- Categories are static (as requested)

✅ **Attribute Management**
- Add new attributes to any category
- Edit existing attributes
- Delete attributes
- Bulk create attributes
- Sort attributes by order

✅ **Admin Interface**
- Clean, card-based layout
- Modal forms for adding/editing
- Real-time updates
- Responsive design

✅ **API Integration**
- Complete CRUD operations
- Proper error handling
- Loading states
- Success/error messages

## Next Steps

1. **Run the initialization script** to create default categories
2. **Implement the frontend components** using the provided code
3. **Test the API endpoints** using the provided examples
4. **Customize the UI** according to your design system
5. **Add validation** for better user experience

The system is now ready for use! Admins can manage job attributes through the intuitive interface, and the data will be properly stored in the database with category relationships.

