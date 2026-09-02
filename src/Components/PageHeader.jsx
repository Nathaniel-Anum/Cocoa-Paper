const PageHeader = ({ title, description, extra, meta }) => {
  return (
    <header className="page-header mb-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-[#582F08]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-[#7a6859]">{description}</p>
          ) : null}
          {meta ? (
            <p className="mt-2 text-xs text-[#7a6859]">{meta}</p>
          ) : null}
        </div>
        {extra ? (
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            {extra}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default PageHeader;
