/*
 * @flow
 */

import { useLayoutEffect, useState } from 'react';
import type { ElementRef } from 'react';

import debounce from 'lodash/debounce';

function usePriorityVisibility<T>(
  containerRef :{ current :null | ElementRef<any> },
  items :T[] = [],
  spacing :number = 0,
  buffer :number = 0
) :[T[], T[]] {
  const [itemWidths, setItemWidths] = useState([]);
  const [{ priority, remainder }, setState] = useState({
    priority: items,
    remainder: []
  });

  // calculate widths of all items
  useLayoutEffect(() => {
    const widths = [];
    if (containerRef?.current) {
      const { children } = containerRef.current;
      for (let i = 0; i < children.length; i += 1) {
        widths.push(children[i].getBoundingClientRect().width);
      }
    }
    setItemWidths(widths);
  }, [containerRef]);

  useLayoutEffect(() => {
    const handleResize = debounce(() => {
      if (containerRef.current && itemWidths.length) {
        const maxWidth = containerRef.current.getBoundingClientRect().width - buffer;
        let priorityWidth = 0;
        let maxIndex = itemWidths.length;
        for (let i = 0; i < itemWidths.length; i += 1) {
          const itemWidth = Math.ceil(itemWidths[i]) + spacing;
          if (priorityWidth + itemWidth > maxWidth) {
            maxIndex = i;
            break;
          }
          else {
            priorityWidth += itemWidth;
          }
        }
        setState({
          priority: items.slice(0, maxIndex),
          remainder: items.slice(maxIndex, itemWidths.length)
        });
      }
    }, 250, { leading: true });

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [
    buffer,
    containerRef,
    itemWidths,
    items,
    spacing,
  ]);

  return [priority, remainder];
}

export default usePriorityVisibility;
