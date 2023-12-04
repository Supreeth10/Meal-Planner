import { Table } from 'react-bootstrap';

/**
 * TableComponent for displaying tabular data.
 * @param headers - Array of table headers.
 * @param rows - Array of table rows.
 * @returns TableComponent.
 */
export const TableComponent = ({ headers, rows }) => (
    <Table striped bordered hover>
        <thead>
            <tr>
                {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    </Table>
);

export default TableComponent;