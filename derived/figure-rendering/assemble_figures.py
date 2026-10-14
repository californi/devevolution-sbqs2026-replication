from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import blue,HexColor
import sys
D=Path(__file__).resolve().parent;P=D.parent/'project';F=Path(sys.argv[1]) if len(sys.argv)>1 else P/'figures';F.mkdir(parents=True,exist_ok=True)
def draw(c,name,x,y,w,h,label):
 image=ImageReader(str(D/(name+'-detail.png')));iw,ih=image.getSize();scale=min(w/iw,h/ih);dw,dh=iw*scale,ih*scale
 c.drawImage(image,x+(w-dw)/2,y+(h-dh)/2+14,width=dw,height=dh)
 c.setFillColor(blue);c.setFont('Helvetica-Bold',12);c.drawCentredString(x+w/2,y,label)
 c.setStrokeColor(HexColor('#bfd7e6'));c.rect(x-2,y+12,w+4,h+4,fill=0,stroke=1)
c=canvas.Canvas(str(F/'devevolution_four_screens_en.pdf'),pagesize=(742.08,610));c.setTitle('English editorial renderings of original archived DevEvolution views')
draw(c,'levels',7,386,354,202,'(a) Stage selection')
draw(c,'study',379,386,354,202,'(b) Instructional flashcard')
draw(c,'wrong',7,5,354,351,'(c) Incorrect answer and explanation')
draw(c,'correct',379,5,354,351,'(d) Correct answer and points')
c.save()
c=canvas.Canvas(str(F/'devevolution_learning_path_summary_en.pdf'),pagesize=(600,417.6));c.setTitle('English editorial details of original learning path and topic summary')
draw(c,'path',6,4,282,380,'(a) Learning path detail')
draw(c,'summary',306,4,288,380,'(b) Topic summary cards')
c.save();print('Original-component editorial figure plates assembled')
