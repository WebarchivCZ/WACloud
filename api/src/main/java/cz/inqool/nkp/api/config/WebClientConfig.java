package cz.inqool.nkp.api.config;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.http.codec.xml.Jaxb2XmlDecoder;
import org.springframework.http.codec.xml.Jaxb2XmlEncoder;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;


import javax.net.ssl.SSLException;

@Configuration
@Slf4j
public class WebClientConfig {

    private static final int MAX_MEMORY_SIZE = 16777216;

    private WebClient.Builder prepareBuilder(String url) throws SSLException {
        SslContext sslContext = SslContextBuilder
                .forClient()
                .trustManager(InsecureTrustManagerFactory.INSTANCE)
                .build();

        HttpClient httpClient = HttpClient.create().secure(t -> t.sslContext(sslContext));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient)) // TODO: UNSAFE!! enable ssl
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(MAX_MEMORY_SIZE))
                .baseUrl(url)
                .exchangeStrategies(ExchangeStrategies.builder().codecs((configurer) -> {
                            configurer.defaultCodecs().jaxb2Encoder(new Jaxb2XmlEncoder());
                            configurer.defaultCodecs().jaxb2Decoder(new Jaxb2XmlDecoder(MimeTypeUtils.TEXT_XML, MimeTypeUtils.TEXT_PLAIN)); })
                        .build());
    }

    private WebClient getWebClient(String url) throws SSLException {
        return prepareBuilder(url).build();
    }

    @Bean(name = "warcExporterWebClient")
    public WebClient webClientWarcExporter(@Value("${warc.exporter.url}") String warcExporterUrl) throws SSLException {
        return getWebClient(warcExporterUrl);
    }
}
