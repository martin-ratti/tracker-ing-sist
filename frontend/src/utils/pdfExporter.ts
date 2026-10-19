import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS, MATERIAS_MAP } from '../data/plan2023';
import { formatPromedio } from './formatters';
import type { EstadoMateria, NotaMateria, PerfilAlumno, MetaExamen } from '../types/plan';
import type { AcademicStats } from './academicCalculations';

export interface FichaCurricularPDFOptions {
  perfil: Partial<PerfilAlumno>;
  estados: Record<number, EstadoMateria>;
  estadosElectivas: Record<number, EstadoMateria>;
  notas: Record<number, NotaMateria>;
  ppsHoras: number;
  stats: AcademicStats;
  metasExamen: Record<number, MetaExamen>;
}

/**
 * Genera y descarga directamente un documento PDF multi-página formal
 * con la ficha curricular, estado de correlatividades y analítico de calificaciones
 * de la carrera Ingeniería en Sistemas de Información (UTN FRRo - Plan 2023).
 */
export function exportFichaCurricularPDF(options: FichaCurricularPDFOptions): void {
  const {
    perfil,
    estados,
    estadosElectivas,
    notas,
    ppsHoras,
    stats,
    metasExamen
  } = options;

  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const fechaEmision = `${day}/${month}/${year}, ${hours}:${minutes} hs`;

  // 1. Encabezado Institucional
  // Emblema UTN FRRo
  doc.setFillColor(15, 30, 60);
  doc.roundedRect(14, 12, 12, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('UTN', 20, 17, { align: 'center' });
  doc.setFontSize(5.5);
  doc.text('FRRo', 20, 21.5, { align: 'center' });

  // Título y Subtítulos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 30, 60);
  doc.text('UNIVERSIDAD TECNOLÓGICA NACIONAL', 29, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Facultad Regional Rosario - Dpto. Ingeniería en Sistemas de Información', 29, 20.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(2, 132, 199);
  doc.text('Plan de Estudio 2023 - Estado de Correlatividades y Calificaciones', 29, 24.5);

  // Fecha de Emisión a la derecha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Fecha de Emisión:', 196, 16, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(fechaEmision, 196, 21, { align: 'right' });

  // Línea divisoria
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 27, 196, 27);

  // 2. Ficha del Estudiante
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 30, 182, 12, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('ESTUDIANTE / ALUMNO:', 18, 34);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const nombreEstudiante = perfil.nombre?.trim() || 'Estudiante UTN ISI';
  doc.text(nombreEstudiante, 18, 39);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('LEGAJO UNIVERSITARIO:', 85, 34);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text(perfil.legajo?.trim() || 'Sin registrar', 85, 39);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('CARRERA:', 145, 34);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Ing. en Sistemas de Información', 145, 39);

  // 3. Tarjetas de Métricas Académicas (4 columnas)
  const cardW = 42.8;
  const cardGap = 3.6;
  const cardY = 45;
  const cardH = 14;

  const metrics = [
    {
      label: 'AVANCE CARRERA',
      value: `${stats.porcentajeCarrera}%`,
      valueColor: [2, 132, 199],
      sub: `${stats.aprobadasCount} / ${stats.totalTroncales} troncales`
    },
    {
      label: 'PROMEDIO ACADÉMICO',
      value: formatPromedio(stats.promedio),
      valueColor: [124, 58, 237],
      sub: 'Materias aprobadas'
    },
    {
      label: 'ELECTIVAS APROBADAS',
      value: `${stats.horasElectivasAprobadas} hs`,
      valueColor: [217, 119, 6],
      sub: 'Meta: 20 hs (ADUSI: 4 hs)'
    },
    {
      label: 'PRÁCTICA PPS',
      value: `${ppsHoras} hs`,
      valueColor: [5, 150, 105],
      sub: 'Meta: 200 hs requeridas'
    }
  ];

  metrics.forEach((m, idx) => {
    const cx = 14 + idx * (cardW + cardGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cardY, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cx + cardW / 2, cardY + 3.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(m.valueColor[0], m.valueColor[1], m.valueColor[2]);
    doc.text(m.value, cx + cardW / 2, cardY + 8.8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.sub, cx + cardW / 2, cardY + 12.2, { align: 'center' });
  });

  // 4. Encabezado de la Sección de Materias Troncales
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 30, 60);
  doc.text('ASIGNATURAS TRONCALES (PLAN 2023)', 14, 63.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${stats.aprobadasCount} aprobadas - ${stats.regularesCount} regulares - ${stats.cursablesCount} cursables`,
    196,
    63.5,
    { align: 'right' }
  );

  let currentY = 66;

  // 5. Tablas de Materias Troncales por Nivel (1º a 5º Año)
  for (const nivel of [1, 2, 3, 4, 5]) {
    const materiasNivel = MATERIAS_TRONCALES.filter(m => m.nivel === nivel && !m.esAdusiSolo);
    const aprobadasNivel = materiasNivel.filter(m => estados[m.id] === 'aprobada').length;

    // Si el espacio restante en la página es menor a 35mm, agregamos página nueva para no dejar el título huérfano
    if (currentY > 255) {
      doc.addPage();
      currentY = 16;
    }

    const bodyRows = materiasNivel.map(m => {
      const est = estados[m.id] || 'pendiente';
      const n = notas[m.id];
      const estadoText = est === 'aprobada' ? 'APROBADA' : est === 'regular' ? 'REGULAR' : 'PENDIENTE';
      const notaText = n?.nota !== undefined ? String(n.nota) : '-';

      return [
        `#${String(m.id).padStart(2, '0')}`,
        m.nombreCompleto,
        m.esCuatrimestral ? 'Cuatrim.' : 'Anual',
        `${m.horas} hs`,
        estadoText,
        notaText
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: 14, right: 14, top: 16, bottom: 16 },
      head: [
        [
          {
            content: `${nivel}º AÑO / NIVEL (${aprobadasNivel} / ${materiasNivel.length} aprobadas)`,
            colSpan: 6,
            styles: {
              fillColor: [30, 58, 95],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 7.5,
              halign: 'left',
              cellPadding: 1.8
            }
          }
        ],
        ['Cód', 'Materia', 'Régimen', 'Hs', 'Estado', 'Nota']
      ],
      body: bodyRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 1.6,
        lineColor: [226, 232, 240],
        lineWidth: 0.15
      },
      headStyles: {
        fillColor: [15, 30, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: [100, 116, 139] },
        1: { cellWidth: 'auto', fontStyle: 'bold', textColor: [15, 23, 42] },
        2: { cellWidth: 18, halign: 'center', textColor: [71, 85, 105] },
        3: { cellWidth: 14, halign: 'center', textColor: [71, 85, 105] },
        4: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index === 4) {
            const val = data.cell.raw;
            if (val === 'APROBADA') {
              data.cell.styles.textColor = [5, 150, 105];
            } else if (val === 'REGULAR') {
              data.cell.styles.textColor = [217, 119, 6];
            } else {
              data.cell.styles.textColor = [148, 163, 184];
            }
          }
          if (data.column.index === 5) {
            const val = data.cell.raw;
            if (val !== '-') {
              data.cell.styles.textColor = [124, 58, 237];
            } else {
              data.cell.styles.textColor = [148, 163, 184];
            }
          }
        }
      }
    });

    const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    currentY = (lastTable?.finalY ?? currentY) + 4;
  }

  // 6. Asignaturas Electivas Acreditadas (si las hubiere)
  const electivasAprobadas = MATERIAS_ELECTIVAS.filter(e => estadosElectivas[e.id] === 'aprobada');
  if (electivasAprobadas.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 16;
    }

    const electivasRows = electivasAprobadas.map(e => [
      e.nombre,
      `${e.nivel}º Nivel`,
      `+${e.horas} hs`,
      'ACREDITADA'
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: 14, right: 14, top: 16, bottom: 16 },
      head: [
        [
          {
            content: `ASIGNATURAS ELECTIVAS ACREDITADAS (${stats.horasElectivasAprobadas} hs)`,
            colSpan: 4,
            styles: {
              fillColor: [180, 83, 9],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 7.5,
              halign: 'left',
              cellPadding: 1.8
            }
          }
        ],
        ['Asignatura Electiva', 'Nivel', 'Carga Horaria', 'Estado']
      ],
      body: electivasRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 1.6,
        lineColor: [226, 232, 240],
        lineWidth: 0.15
      },
      headStyles: {
        fillColor: [15, 30, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold', textColor: [15, 23, 42] },
        1: { cellWidth: 25, halign: 'center', textColor: [71, 85, 105] },
        2: { cellWidth: 25, halign: 'center', fontStyle: 'bold', textColor: [217, 119, 6] },
        3: { cellWidth: 25, halign: 'center', fontStyle: 'bold', textColor: [5, 150, 105] }
      }
    });

    const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    currentY = (lastTable?.finalY ?? currentY) + 4;
  }

  // 7. Próximos Finales Planificados (Metas de Examen)
  const metasArray = Object.values(metasExamen);
  if (metasArray.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 16;
    }

    const metasRows = metasArray.map(meta => {
      const mat = MATERIAS_MAP[meta.materiaId];
      return [
        mat ? mat.nombreCompleto : `Materia #${meta.materiaId}`,
        meta.turnoNombre,
        meta.fechaEstimada || '-'
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: 14, right: 14, top: 16, bottom: 16 },
      head: [
        [
          {
            content: 'METAS TENTATIVAS DE EXAMEN AGENDADAS',
            colSpan: 3,
            styles: {
              fillColor: [8, 145, 178],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 7.5,
              halign: 'left',
              cellPadding: 1.8
            }
          }
        ],
        ['Materia', 'Turno / Llamado', 'Fecha Estimada']
      ],
      body: metasRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 1.6,
        lineColor: [226, 232, 240],
        lineWidth: 0.15
      },
      headStyles: {
        fillColor: [15, 30, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold', textColor: [15, 23, 42] },
        1: { cellWidth: 45, halign: 'center', textColor: [2, 132, 199] },
        2: { cellWidth: 35, halign: 'center', textColor: [71, 85, 105] }
      }
    });
  }

  // 8. Pie institucional con paginación formal en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, 287, 196, 287);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Tracker Plan de Estudio ISI · UTN Facultad Regional Rosario', 14, 291.5);
    doc.text('Documento informativo no oficial de seguimiento académico', 105, 291.5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`Página ${i} de ${totalPages}`, 196, 291.5, { align: 'right' });
  }

  // 9. Descarga automática del archivo PDF
  const sanitizedLegajo = perfil.legajo ? perfil.legajo.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : 'Plan2023';
  const filename = `Ficha_Curricular_UTN_ISI_${sanitizedLegajo}.pdf`;
  doc.save(filename);
}
