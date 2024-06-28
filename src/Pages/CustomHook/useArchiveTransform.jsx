import React, { useEffect, useState } from "react";

const useArchiveTransform = (archives, id) => {
  const [data, setData] = useState([]);

  function flattenArray(arr) {
    return arr?.reduce((acc, current) => {
      if (current?.createdAt) {
        return acc.concat(current);
      } else if (Array.isArray(current?.files) && current?.files.length > 0) {
        return acc.concat(current.files);
      } else {
        return acc;
      }
    }, []);
  }

  function flattenSubArchiveDataArr(arr) {
    let temp = [];

    if (arr?.files && arr?.files?.length > 0) temp = [...arr.files];

    if (arr?.children && arr?.children?.length > 0)
      temp = [...temp, ...arr.children];

    temp = flattenArray(temp);
    return temp;
  }

  useEffect(() => {
    if (id) {
      const temp = flattenSubArchiveDataArr(archives);
      setData(temp);
    } else {
      const temp = flattenArray(archives);
      console.log(temp, archives);
      setData(temp);
    }
  }, [id, archives]);

  return {
    _data: data,
  };
};

export default useArchiveTransform;
