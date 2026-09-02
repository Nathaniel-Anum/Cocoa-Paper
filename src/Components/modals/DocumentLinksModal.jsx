import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import LinkedDocuments from '../LinkedDocuments';
import LinkDocumentModal from './LinkDocumentModal';

const DocumentLinksModal = ({
  open,
  onClose,
  documentId,
  documentSubject,
}) => {
  const [stack, setStack] = useState([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  useEffect(() => {
    if (open && documentId) {
      setStack([{ id: documentId, subject: documentSubject || 'Document' }]);
    }
    if (!open) {
      setStack([]);
      setIsLinkModalOpen(false);
    }
  }, [open, documentId, documentSubject]);

  const current = stack[stack.length - 1];

  const pushDocument = (docId, subject) => {
    if (!docId) return;
    setStack((prev) => [...prev, { id: docId, subject: subject || 'Linked document' }]);
  };

  const goBack = () => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  return (
    <>
      <Modal
        title={
          <div className="pr-8">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#9D4D01] mb-1">
              Document linking
            </p>
            <h2 className="text-lg font-semibold text-[#582F08] leading-snug m-0">
              {current?.subject}
            </h2>
          </div>
        }
        open={open}
        onCancel={onClose}
        footer={
          <div className="flex items-center justify-between gap-3">
            {stack.length > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="text-sm text-[#9D4D01] hover:underline"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => setIsLinkModalOpen(true)}
              className="bg-[#582F08]"
            >
              Link document
            </Button>
          </div>
        }
        width={720}
        destroyOnClose
        className="document-links-modal"
      >
        <div className="space-y-4 pt-1">
          {stack.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 text-xs text-[#7a6859]">
              {stack.map((item, index) => (
                <React.Fragment key={`${item.id}-${index}`}>
                  {index > 0 && <span className="text-[#d6c3b7]">/</span>}
                  <button
                    type="button"
                    className={`truncate max-w-[160px] ${
                      index === stack.length - 1
                        ? 'font-semibold text-[#582F08]'
                        : 'hover:text-[#9D4D01]'
                    }`}
                    onClick={() => setStack((prev) => prev.slice(0, index + 1))}
                  >
                    {item.subject}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          <LinkedDocuments
            documentId={current?.id}
            onViewLinks={pushDocument}
          />
        </div>
      </Modal>

      <LinkDocumentModal
        open={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        documentId={current?.id}
        documentSubject={current?.subject}
      />
    </>
  );
};

export default DocumentLinksModal;
