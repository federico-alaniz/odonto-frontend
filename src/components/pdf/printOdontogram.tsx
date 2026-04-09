import { renderToString } from 'react-dom/server';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import React from 'react';
import { OdontogramTemplate } from './OdontogramTemplate';

export interface PrintOdontogramOptions {
  patient?: any;
  patientName?: string;
  consultationDate?: string | Date;
  doctorName?: string;
  doctorMatricula?: string;
  odontogramConditions?: any[];
  observaciones?: string;
}

export async function printOdontogram(opts: PrintOdontogramOptions) {
  const {
    patient,
    patientName,
    consultationDate,
    doctorName,
    doctorMatricula,
    odontogramConditions = [],
    observaciones = ''
  } = opts;

  // Crear un elemento temporal para renderizar el odontograma
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm';
  tempDiv.style.height = '297mm';
  tempDiv.style.padding = '20px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = 'Arial, sans-serif';

  const odontogramHTML = renderToString(
    <OdontogramTemplate
      patientName={patientName}
      patient={patient}
      consultationDate={consultationDate}
      doctorName={doctorName}
      doctorMatricula={doctorMatricula}
      odontogramConditions={odontogramConditions}
      observaciones={observaciones}
      printMode={true}
    />
  );

  tempDiv.innerHTML = odontogramHTML;
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 190; // A4 width - margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= 277; // A4 height - margins

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= 277;
    }

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } finally {
    // Limpiar elemento temporal
    try {
      document.body.removeChild(tempDiv);
    } catch (e) {
      // ignore
    }
  }
}

export default printOdontogram;
