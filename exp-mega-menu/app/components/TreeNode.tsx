import { useState, useCallback } from 'react';
import {
  Frame,
  Button,
  Modal,
  TextField,
  Card,
} from '@shopify/polaris';
import TreeModal  from "../components/TreeModal";




export default function PopupLayoutModal() {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('Mega Menu');

  const handleToggle = useCallback(() => setActive(prev => !prev), []);
  const handleChange = useCallback((val: string) => setValue(val), []);

  const activator = <Button onClick={handleToggle}>Open Layout Modal</Button>;

  return (
    <Frame>


      <div className="custom-layout-modal">
        <Modal
          open={active}
          onClose={handleToggle}
          title="Mega Menu Layout"
          activator={activator}
          primaryAction={{ content: 'Save', onAction: handleToggle }}
          secondaryActions={[{ content: 'Cancel', onAction: handleToggle }]}
        >
          <Modal.Section>
            <div style={{ display: 'flex', gap: '20px', height: '65vh' }}>
              {/*  LEFT PANEL: 2/3 width */}
              <div
                style={{
                  flex: 2,
                  borderRight: '1px solid #ccc',
                  paddingRight: 16,
                  overflowY: 'auto',
                }}
              >
                <TextField
                  label="Menu Name"
                  value={value}
                  onChange={handleChange}
                  autoComplete="off"
                />
                <div>
                  <TreeModal></TreeModal>
                </div>
                
              </div>

              {/*  RIGHT PANEL: 1/3 width */}
              {/* <div
                style={{
                  flex: 1,
                  background: '#f4f6f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Card>
                  <p style={{ padding: '20px' }}>
                    Preview: <strong>{value}</strong>
                  </p>
                </Card>
              </div> */}
            </div>
          </Modal.Section>
        </Modal>
      </div>
    </Frame>
  );
}
