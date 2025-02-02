import { Modal, Steps, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const Trail = ({ trails, open, handleCancel }) => {
  return (
    <div>
      <Modal
        title="Locator"
        open={open}
        onCancel={handleCancel}
        footer={null}
        centered="true"
        width={'60%'}
      >
        <div className="py-6">
          <Steps
            responsive
            direction
            className="grid grid-cols-2 gap-y-2"
            items={
              trails &&
              trails.flatMap((trail, index) => {
                // Get createdAt and updatedAt times
                const createdDateTime = trail.createdAt
                  ? dayjs(trail.createdAt)
                  : null;
                const updatedDateTime = trail.updatedAt
                  ? dayjs(trail.updatedAt)
                  : null;

                // Format the date and time
                const formattedCreatedDate = createdDateTime
                  ? createdDateTime.format('dddd MMM DD YYYY')
                  : null;
                const formattedUpdatedDate = updatedDateTime
                  ? updatedDateTime.format('dddd MMM DD YYYY')
                  : null;

                const formattedCreatedTime = createdDateTime
                  ? createdDateTime.format('hh:mm:ss A')
                  : null;
                const formattedUpdatedTime = updatedDateTime
                  ? updatedDateTime.format('hh:mm:ss A')
                  : null;

                // Create a title with a tooltip showing the createdAt date/time for the first one and updatedAt for others
                const titleWithTooltip = (
                  <Tooltip
                    title={
                      <div>
                        {/* Show createdAt for the first item */}
                        {index === 0 && formattedCreatedDate && (
                          <p>Date: {formattedCreatedDate}</p>
                        )}
                        {index === 0 && formattedCreatedTime && (
                          <p>Time: {formattedCreatedTime}</p>
                        )}

                        {/* Show updatedAt for all other items */}
                        {index !== 0 && formattedUpdatedDate && (
                          <p>Date : {formattedUpdatedDate}</p>
                        )}
                        {index !== 0 && formattedUpdatedTime && (
                          <p>Time : {formattedUpdatedTime}</p>
                        )}
                      </div>
                    }
                  >
                    <span className="cursor-pointer">
                      {index === 0 ? 'Sent' : trail.status}
                    </span>
                  </Tooltip>
                );

                if (index === 0) {
                  return [
                    {
                      title: titleWithTooltip,
                      description: trail.sender.name,
                    },
                    {
                      title: (
                        <Tooltip
                          title={
                            <>
                              {formattedUpdatedDate && (
                                <p>Date: {formattedUpdatedDate}</p>
                              )}
                              {formattedUpdatedTime && (
                                <p>Time: {formattedUpdatedTime}</p>
                              )}
                            </>
                          }
                        >
                          <span className="cursor-pointer">{trail.status}</span>
                        </Tooltip>
                      ),
                      description: trail.receiver.name,
                    },
                  ];
                } else {
                  return {
                    title: titleWithTooltip,
                    description: trail.receiver.name,
                  };
                }
              })
            }
          />
        </div>
      </Modal>
    </div>
  );
};

export default Trail;
