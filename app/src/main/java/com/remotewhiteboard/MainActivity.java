package com.remotewhiteboard;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import android.annotation.SuppressLint;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.pdf.PdfDocument;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.text.format.Formatter;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.ServerSocket;

class SocketInteraction extends Thread{
    public static String ip = "";
    public static File filesDir;
    public static String doc = "";
    public static WifiManager wifiManager;
    File external;

    public void run() {
        try{
            WifiInfo wifiInfo = wifiManager.getConnectionInfo();
            int ipInt = wifiInfo.getIpAddress();
            ip = Formatter.formatIpAddress(ipInt) + ":8080";
        }catch (Exception e){
            e.printStackTrace();
        }
        if(ip.equalsIgnoreCase("0.0.0.0:8080")){
            ip = "192.168..43.1:8080";
        }

        MainActivity.view.post(new Runnable() {
            @Override
            public void run() {
                MainActivity.view.setWebViewClient(new WebViewClient(){
                    public void onPageFinished(WebView view, String weburl) {
                        super.onPageFinished(view, weburl);
                        String data = "'{\"type\" : \"ip\", \"data\" : \"" + SocketInteraction.ip + "\"}' ";
                        view.loadUrl("javascript:getData(" + data + ");");
                    }
                });
            }
        });


        try {
            ServerSocket serverConnect = new ServerSocket(JavaHTTPServer.PORT);
            while (true) {
                JavaHTTPServer myServer = new JavaHTTPServer(serverConnect.accept());
                Thread thread = new Thread(myServer);
                thread.start();
            }

        } catch (IOException e) {
            System.err.println("Server Connection error : " + e.getMessage());
        }
    }
}


class DatabaseHandler extends SQLiteOpenHelper {
    private static final int DATABASE_VERSION = 1;
    private static final String DATABASE_NAME = "vWhiteBoard";

    public DatabaseHandler(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    // Creating Tables
    @Override
    public void onCreate(SQLiteDatabase db) {

    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
    }
}


class WebAppInterface {
    Context mContext;
    String action = "";
    public static MainActivity activity;
    public static DatabaseHandler databaseHandler;
    public static SQLiteDatabase db;

    WebAppInterface(Context c) {
        mContext = c;
    }

    @JavascriptInterface
    public void runDDL(String query) {
        try{
            db.execSQL(query);
        }catch (Exception e){
        }
    }

    @JavascriptInterface
    public String runSQL(String query) {
        JSONArray resultSet = new JSONArray();
        SQLiteDatabase db = databaseHandler.getReadableDatabase();
        try{
            Cursor cursor = db.rawQuery(query, null);
            cursor.moveToFirst();
            resultSet = new JSONArray();
            cursor.moveToFirst();
            while (cursor.isAfterLast() == false) {
                final int totalColumn = cursor.getColumnCount();
                JSONObject rowObject = new JSONObject();
                int i;// = 0;
                for (  i = 0; i < totalColumn; i++) {

                    if (cursor.getColumnName(i) != null) {
                        try {
                            String getcol = cursor.getColumnName(i), getstr = cursor.getString(i);
                            rowObject.put(getcol, getstr );
                        } catch (Exception e) {
                        }
                    }
                }
                resultSet.put(rowObject);
                cursor.moveToNext();
            }
            cursor.close();
        }catch (Exception e){
        }
        return resultSet.toString();
    }

    @JavascriptInterface
    public void beginTransaction(){
        db.beginTransaction();
    }

    @JavascriptInterface
    public void successfulTransaction(){
        db.setTransactionSuccessful();
    }
    
    @JavascriptInterface
    public void endTransaction(){
        db.endTransaction();
    }

    @JavascriptInterface
    public void storeInQueue(String data) {
        if (data.equalsIgnoreCase("clear")) {
            while (JavaHTTPServer.locked) {
            }
            JavaHTTPServer.queue.clear();
        }else if(data.equalsIgnoreCase("pdf")) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                createPdf();
            }
        }else if(data.equalsIgnoreCase("ip")){
            try{
                WifiInfo wifiInfo = SocketInteraction.wifiManager.getConnectionInfo();
                int ipInt = wifiInfo.getIpAddress();
                SocketInteraction.ip = Formatter.formatIpAddress(ipInt) + ":8080";
            }catch (Exception e){
                e.printStackTrace();
            }
            if(SocketInteraction.ip.equalsIgnoreCase("0.0.0.0:8080")){
                SocketInteraction.ip = "192.168..43.1:8080";
            }
            MainActivity.view.post(new Runnable() {
                @Override
                public void run() {
                    String data = "'{\"type\" : \"ip\", \"data\" : \"" + SocketInteraction.ip + "\"}' ";
                    MainActivity.view.loadUrl("javascript:getData(" + data + ");");
                }
            });

        }else{
            JavaHTTPServer.queue.add(data);
        }
    }
    public static void sendData(final String data){
        MainActivity.view.post(new Runnable() {
            @Override
            public void run() {
                MainActivity.view.loadUrl("javascript:getData('" + data + "');");
            }
        });
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    public void createPdf(){
        Cursor cursor = db.rawQuery("SELECT MAX(PAGE_NO) FROM WORKINGPATH", null);
        cursor.moveToFirst();
        int maxPage = 1;
        if(cursor.isAfterLast() == false){
            maxPage = Integer.valueOf(cursor.getString(0));
        }

        String fileName = "";
        cursor = db.rawQuery("SELECT OPENED FROM SETTINGS", null);
        cursor.moveToFirst();
        fileName = cursor.getString(0);
        if(fileName.equalsIgnoreCase("")){
            fileName = "untitled";
        }

        String data = "";
        try{
            PdfDocument document = new PdfDocument();
            // crate a page description
            PdfDocument.PageInfo pageInfo;
            PdfDocument.Page page;
            Canvas canvas;
            Paint paint;
            Path path = new Path();
            int pageNo = 1;

            cursor = db.rawQuery("SELECT * FROM FILES WHERE ID = 1", null);
            cursor.moveToFirst();
            String height = "", width = "";
            width = cursor.getString(4);
            height = cursor.getString(5);
            while(pageNo <= maxPage) {

                JSONObject json;
                json = new JSONObject();
                JSONArray jsonArray = new JSONArray();

                cursor = db.rawQuery("SELECT * FROM WORKINGPATH WHERE PAGE_NO = " + pageNo + " ORDER BY PATH_NO" , null);
                cursor.moveToFirst();
                while(cursor.isAfterLast() == false){
                    json = new JSONObject();
                    json.put("width", cursor.getString(2));
                    json.put("color", cursor.getString(3));
                    json.put("arr", new JSONArray(cursor.getString(4)) );
                    jsonArray.put(json);
                    cursor.moveToNext();
                }

                pageInfo = new PdfDocument.PageInfo.Builder(Integer.valueOf(width), Integer.valueOf(height), 1).create();
                // start a page
                page = document.startPage(pageInfo);

                canvas = page.getCanvas();

                paint = new Paint();
                paint.setStyle(Paint.Style.STROKE);

                for (int i = 0; i < jsonArray.length(); i++) {
                    json = (JSONObject) jsonArray.get(i);
                    JSONArray arr = (JSONArray) json.get("arr");
                    String lineWidth = json.get("width").toString();
                    String color = json.get("color").toString();
                    System.out.println(lineWidth);
                    paint.setStrokeWidth(Float.valueOf(lineWidth));
                    if(color.length() == 4){
                        color += color.substring(1);
                    }
                    paint.setColor(Color.parseColor(color));

                    path = new Path();
                    for (int j = 0; j < arr.length(); j++) {
                        JSONObject point = (JSONObject) arr.get(j);
                        float x = Float.valueOf((point.get("x").toString()));
                        float y = Float.valueOf((point.get("y").toString()));
                        if (j == 0) {
                            path.moveTo( x,  y);
                        } else {
                            path.lineTo(x, y);
                        }
                    }
                    canvas.drawPath(path, paint);
                }
                document.finishPage(page);
                pageNo++;
            }

            try {
                ActivityCompat.requestPermissions(activity, new String[]{android.Manifest.permission.WRITE_EXTERNAL_STORAGE},23);
                File doc = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
                if(!doc.exists()){
                    doc.mkdir();
                }
                File file = new File(doc, fileName + ".pdf");
                int fileNo = 1;
                while(file.exists()){
                    file = new File(doc, fileName + " " + fileNo + ".pdf");
                    fileNo++;
                }

                document.writeTo(new FileOutputStream(file));
                Toast.makeText(activity, "Pdf Saved to: " + file.getAbsolutePath(), Toast.LENGTH_LONG).show();
            } catch (IOException e) {
                e.printStackTrace();
                Toast.makeText(activity, "Something wrong: " + e.toString(),
                        Toast.LENGTH_LONG).show();
            }
            document.close();
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}

public class MainActivity extends AppCompatActivity {

    public static WebView view;

    @SuppressLint("ClickableViewAccessibility")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        DatabaseHandler db = new DatabaseHandler(this);
        WebAppInterface.databaseHandler = db;
        WebAppInterface.db = db.getWritableDatabase();

        try{
            SocketInteraction.wifiManager = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
        }catch (Exception e){
        }

        view = (WebView) findViewById(R.id.WebView);
        view.getSettings().setJavaScriptEnabled(true);
        view.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);
        view.getSettings().setDomStorageEnabled(true);
        view.getSettings().setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NARROW_COLUMNS);
        view.getSettings().setUseWideViewPort(true);
        view.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        view.getSettings().setEnableSmoothTransition(true);
        view.getSettings().setLoadsImagesAutomatically(true);
        view.loadUrl("file:///android_asset/index.html");

//        view.loadUrl("http://192.168.0.108/touchPen/");
        view.setWebViewClient(new WebViewController());

//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
//            view.setWebContentsDebuggingEnabled(true);
//        }

        view.addJavascriptInterface(new WebAppInterface(this), "Android");

        SocketInteraction.filesDir = getFilesDir();
        SocketInteraction socket = new SocketInteraction();
        socket.start();
        WebAppInterface.activity = this;
        GetFile.assetManager = getAssets();
    }
}