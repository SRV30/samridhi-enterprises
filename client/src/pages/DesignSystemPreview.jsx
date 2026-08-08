import React, { useState } from 'react';
import { 
  Button, Input, Textarea, Select, Checkbox, Radio, Toggle, 
  Badge, Chip, Loader, Skeleton, ProductCard, CategoryCard, 
  DashboardCard, Tabs, Accordion, Modal 
} from '../components/ui';

const DesignSystemPreview = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [toggleState, setToggleState] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col gap-10 font-sans">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Samridhi Global Design System</h1>
      </div>
      
      {/* 1. FORMS CONTENT SECTIONS */}
      <section className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">1. Form Controls & Interactive Primitives</h2>
        
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase">Buttons Base Architecture</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Base</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Border</Button>
            <Button variant="danger">Danger Protocol</Button>
            <Button variant="primary" disabled={true}>System Offline</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <Input label="Direct Consumer Email" placeholder="username@samridhi.com" />
          <Input label="Administrative Password Access" type="password" placeholder="••••••••" error="Security context requires 8+ characters" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Textarea label="Corporate Dispatch Shipping Address" placeholder="Enter full logistics destination address..." />
          <Select label="Dynamic Spare Parts Core Categories" options={[
            { value: '1', label: 'Brake System Engineering' },
            { value: '2', label: 'High-Performance Engine Modules' },
            { value: '3', label: 'Transmission & Geartrain Assemblies' }
          ]} />
        </div>

        <div className="flex flex-wrap gap-8 items-center mt-2 bg-gray-50 p-4 rounded-lg">
          <Checkbox id="agree" label="I explicitly verify structural documentation" defaultChecked />
          <div className="flex gap-4">
            <Radio name="gender" id="m" label="Standard Customer Panel" defaultChecked />
            <Radio name="gender" id="f" label="Root Admin Access" />
          </div>
          <Toggle checked={toggleState} onChange={() => setToggleState(!toggleState)} label="Dynamic Stock Alert Protocol" />
        </div>
      </section>

      {/* 2. LIVE ENTERPRISE CARD WRAPPERS */}
      <section className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">2. Domain-Specific Structural Layout Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardCard title="Total Enterprise Revenue" value="₹1,62,000" icon="💼" trend="18.2%" status="info" />
          <DashboardCard title="Active Parts Orders" value="248" icon="📦" trend="4.3%" status="success" />
          <DashboardCard title="Verified Global Clients" value="1,842" icon="👥" status="warning" />
          <DashboardCard title="Critical Low Stock Items" value="12" icon="⚠️" status="danger" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          <ProductCard title="Front Disc Brake Assembly (High Friction)" price="1,000" category="Brake System" tag="Top Seller" />
          <ProductCard title="Premium Hydraulic Brake Switch" price="1,505" category="Electrical Systems" />
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">Structural Identity Nodes</h3>
            <CategoryCard name="Brake Propulsion Systems" count="120" icon="⚙️" />
            <CategoryCard name="High-Compression Engine Parts" count="85" icon="🔩" />
          </div>
        </div>
      </section>

      {/* 3. FEEDBACK STATES & NAVIGATION */}
      <section className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">3. Status Indicators & Interface Overlays</h2>
        
        <div className="flex flex-wrap gap-6 items-center bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-2"><Badge status="success">In Stock</Badge><Badge status="warning">Low Stock</Badge><Badge status="error">Out of Stock</Badge></div>
          <div className="flex gap-2"><Chip label="Bajaj Genuine Parts" /><Chip label="Hero MotoCorp" /></div>
          <div className="flex items-center gap-2 text-sm text-gray-500"><Loader /> Syncing Database Nodes...</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">Contextual Layout Tabs</h3>
            <Tabs tabs={[
              { id: 'tab1', label: 'Processing Logs' },
              { id: 'tab2', label: 'Dispatched Invoices' },
              { id: 'tab3', label: 'Archived Claims' }
            ]} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">Render context block for: <b>{activeTab}</b></div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">Collapsible Accordions & Skeletons</h3>
            <Accordion title="Enterprise Redesign SLA Architecture Policy">
              This global atomic subsystem dynamically abstracts presentation states entirely outside core functional API business contexts.
            </Accordion>
            <div className="flex flex-col gap-2 mt-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>Launch Functional Overlay Modal</Button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="System Operational Protocol">
            <p className="text-gray-600 mb-4">This layout overlay proves overlay alignment structure is working perfectly under PR 2 specifications.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="!py-1.5" onClick={() => setIsModalOpen(false)}>Dismiss</Button>
              <Button variant="primary" className="!py-1.5" onClick={() => setIsModalOpen(false)}>Acknowledge</Button>
            </div>
          </Modal>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemPreview;