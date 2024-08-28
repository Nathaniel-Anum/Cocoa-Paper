import { Link } from 'react-router-dom';

export const itemrenderer = (crumbs) => {
  return function itemRender(currentRoute, params, items, paths) {
    console.log('I have been called');
    // const isLast = currentRoute?.path === items[items.length - 1]?.path;
    localStorage.removeItem('crumbs');
    localStorage.setItem('crumbs', JSON.stringify(crumbs));
    // console.log({ currentRoute, paths });
    localStorage.setItem('currentRoute', currentRoute.path);

    // return isLast ? (
    //   <span>{currentRoute.title}</span>
    // ) :
    return (
      <Link
        to={
          currentRoute.path === '/archive'
            ? '/archive'
            : `/archive${localStorage.getItem('currentRoute')}`
        }
      >
        {currentRoute.title}
      </Link>
    );
  };
};
