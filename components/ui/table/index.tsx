import React, { createContext, useMemo, useContext } from 'react';
import {
  Table as ExpoTable,
  THead as ExpoTHead,
  TBody as ExpoTBody,
  TFoot as ExpoTFoot,
  TR as ExpoTR,
  Caption as ExpoTCaption,
} from '@expo/html-elements';

import {
  tableStyle,
  tableHeaderStyle,
  tableBodyStyle,
  tableFooterStyle,
  tableHeadStyle,
  tableRowStyleStyle,
  tableDataStyle,
  tableCaptionStyle,
} from './styles';
import { Text, View } from 'react-native';

const TableHeaderContext = createContext<{
  isHeaderRow: boolean;
}>({
  isHeaderRow: false,
});
const TableFooterContext = createContext<{
  isFooterRow: boolean;
}>({
  isFooterRow: false,
});

type ITableProps = React.ComponentProps<typeof ExpoTable>;
type ITableHeaderProps = React.ComponentProps<typeof ExpoTHead>;
type ITableBodyProps = React.ComponentProps<typeof ExpoTBody>;
type ITableFooterProps = React.ComponentProps<typeof ExpoTFoot>;
type ViewComponentProps = React.ComponentProps<typeof View> & {
  className?: string;
};
type TextComponentProps = React.ComponentProps<typeof Text> & {
  className?: string;
};

type ITableHeadProps =
  | (ViewComponentProps & { useRNView: true })
  | (TextComponentProps & { useRNView?: false });
type ITableRowProps = React.ComponentProps<typeof ExpoTR>;
type ITableDataProps =
  | (ViewComponentProps & { useRNView: true })
  | (TextComponentProps & { useRNView?: false });
type ITableCaptionProps = React.ComponentProps<typeof ExpoTCaption>;

const Table = React.forwardRef<
  React.ComponentRef<typeof ExpoTable>,
  ITableProps
>(({ className, ...props }, ref) => {
  return (
    <ExpoTable
      ref={ref}
      className={tableStyle({ class: className })}
      {...props}
    />
  );
});

const TableHeader = React.forwardRef<
  React.ComponentRef<typeof ExpoTHead>,
  ITableHeaderProps
>(function TableHeader({ className, ...props }, ref) {
  const contextValue = useMemo(() => {
    return {
      isHeaderRow: true,
    };
  }, []);
  return (
    <TableHeaderContext.Provider value={contextValue}>
      <ExpoTHead
        ref={ref}
        className={tableHeaderStyle({ class: className })}
        {...props}
      />
    </TableHeaderContext.Provider>
  );
});

const TableBody = React.forwardRef<
  React.ComponentRef<typeof ExpoTBody>,
  ITableBodyProps
>(function TableBody({ className, ...props }, ref) {
  return (
    <ExpoTBody
      ref={ref}
      className={tableBodyStyle({ class: className })}
      {...props}
    />
  );
});

const TableFooter = React.forwardRef<
  React.ComponentRef<typeof ExpoTFoot>,
  ITableFooterProps
>(function TableFooter({ className, ...props }, ref) {
  const contextValue = useMemo(() => {
    return {
      isFooterRow: true,
    };
  }, []);
  return (
    <TableFooterContext.Provider value={contextValue}>
      <ExpoTFoot
        ref={ref}
        className={tableFooterStyle({ class: className })}
        {...props}
      />
    </TableFooterContext.Provider>
  );
});

const TableHead = (props: ITableHeadProps) => {
  if (props.useRNView) {
    const { useRNView, className, ...rest } = props;
    return <View className={tableHeadStyle({ class: className })} {...rest} />;
  }

  const { useRNView, className, ...rest } = props;
  return <Text className={tableHeadStyle({ class: className })} {...rest} />;
};

const TableRow = React.forwardRef<
  React.ComponentRef<typeof ExpoTR>,
  ITableRowProps
>(function TableRow({ className, ...props }, ref) {
  const { isHeaderRow } = useContext(TableHeaderContext);
  const { isFooterRow } = useContext(TableFooterContext);

  return (
    <ExpoTR
      ref={ref}
      className={tableRowStyleStyle({
        isHeaderRow,
        isFooterRow,
        class: className,
      })}
      {...props}
    />
  );
});

const TableData = (props: ITableDataProps) => {
  if (props.useRNView) {
    const { useRNView, className, ...rest } = props;
    return <View className={tableDataStyle({ class: className })} {...rest} />;
  }

  const { useRNView, className, ...rest } = props;
  return <Text className={tableDataStyle({ class: className })} {...rest} />;
};

const TableCaption = React.forwardRef<
  React.ComponentRef<typeof ExpoTCaption>,
  ITableCaptionProps
>(({ className, ...props }, ref) => {
  return (
    <ExpoTCaption
      ref={ref}
      className={tableCaptionStyle({ class: className })}
      {...props}
    />
  );
});

Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableFooter.displayName = 'TableFooter';
TableHead.displayName = 'TableHead';
TableRow.displayName = 'TableRow';
TableData.displayName = 'TableData';
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableData,
  TableCaption,
};
